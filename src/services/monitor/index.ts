import { CronJob } from 'cron';
import { NhlApiClient } from '../../repositories/NhlApiClient';
import { spawn } from 'child_process';
import * as path from 'path';
import fs from 'fs';
import { NonEmptyArray, sleep } from '../../lib/utils';

type UpdateGamesType = (dates: any[], statusesToIngest: NonEmptyArray<string>, deps: UpdateGamesDeps) => Promise<void>
export interface MonitorDeps {
  cronJob: typeof CronJob
  updateGames: UpdateGamesType
  nhlApiClient: typeof NhlApiClient
};

export async function monitor(cronString: string, deps: MonitorDeps) {  
  const { cronJob, updateGames, nhlApiClient } = deps;
  
  console.info(`${new Date()} - Starting NHL Schedule Monitor`);
  
  const updateGamesFn = async () => {
    // Get rolling window of games (yesterday through tomorrow).
    // Window avoids potential issues with day boundaries such as not
    // updating game status that started before midnight and ended after midnight
    try {
      const dates = await nhlApiClient.getScheduleToday();
      await updateGames(dates, ["Live"], { spawn });
    } catch (err) {
      console.error(`${new Date()} - Could not update games`, err);
    }
  };
  
  // run immediately then schedule cron job
  await updateGamesFn();
  new cronJob(cronString, updateGamesFn, null, true, 'America/New_York');
}

export interface IngestSeasonsDeps {
  updateGames: UpdateGamesType
  nhlApiClient: typeof NhlApiClient
};

export async function ingestSeasons(seasons: string[], deps: IngestSeasonsDeps) {  
  const { updateGames, nhlApiClient } = deps;
  
  console.info(`${new Date()} - Starting NHL Season Ingestor Spawner`);
  
  try {
    const dates = await nhlApiClient.getScheduleSeasons(seasons);
    await updateGames(dates, ['Final'], { spawn });
  } catch (err) {
    console.error(`${new Date()} - Could not update games`, err);
  }
}

interface UpdateGamesDeps {
  spawn: typeof spawn
}

export async function updateGames(dates: any[], statusesToIngest: NonEmptyArray<string>, deps: UpdateGamesDeps){
  const { spawn } = deps;
  try{
    console.info(`${new Date()} - Starting updateGame job`);
    const out = fs.openSync('./out.log', 'a');
    const err = fs.openSync('./out.log', 'a');

    for (const date of dates){
      console.info(`${new Date()} - Checking ${date?.games?.length ?? 0} games`);
      for (const game of date.games) {
        const status = game.status.abstractGameState;
        if(!statusesToIngest.includes(status)) continue;

        // start ingesting in new process.
        const ingestPath = path.join(__dirname, '../ingest/index.js');
        const childProcess = spawn('node', [ingestPath, game.gamePk], {
          // detatch and reroute stdio to file so killing this process wont kill children.
          detached: true,
          stdio: [ 'ignore', out, err ]
        });
        // unref because this process should not wait for children to exit
        childProcess.unref();

        console.info(`${new Date()} - Ingesting game: ${game.gamePk} in pid: ${childProcess.pid}`);
        await sleep(500);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

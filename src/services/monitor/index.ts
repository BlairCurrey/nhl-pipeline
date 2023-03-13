import { CronJob } from 'cron';
import { NhlApiClient } from '../../repositories/NhlApiClient';
import { spawn } from 'child_process';
import * as path from 'path';
import fs from 'fs';
import { NonEmptyArray } from '../../lib/utils';


export interface MonitorDeps {
  cronJob: typeof CronJob
  updateGames: (statusesToIngest: NonEmptyArray<string>, deps: UpdateGameDeps) => Promise<void>
  nhlApiClient: typeof NhlApiClient
};

export async function monitor(cronString: string, deps: MonitorDeps) {  
  const { cronJob, updateGames, nhlApiClient } = deps;
  
  console.info(`${new Date()} - Starting NHL Schedule Monitor`);
  
  const updateGamesFn = async () => {
    await updateGames(["Live"], { nhlApiClient });
  };
  
  // run immediately then schedule cron job
  await updateGamesFn();
  new cronJob(cronString, updateGamesFn, null, true, 'America/New_York');
}

interface UpdateGameDeps {
  nhlApiClient: typeof NhlApiClient
}

export async function updateGames(statusesToIngest: NonEmptyArray<string>, deps: UpdateGameDeps){
  const { nhlApiClient } = deps;

  try{
    console.info(`${new Date()} - Starting updateGame job`);
    // Get rolling window of games (yesterday through tomorrow).
    // Window avoids potential issues with day boundaries such such as
    // not seeing live game that started on previous day
    const dates = await nhlApiClient.getSchedule();
    const out = fs.openSync('./out.log', 'a');
    const err = fs.openSync('./out.log', 'a');

    dates.forEach((date: any) => {
      console.info(`${new Date()} - Checking ${date?.games?.length ?? 0} games`);
      date?.games.forEach(async (scheduledGame: any) => {
        const status = scheduledGame.status.abstractGameState;
        if(!statusesToIngest.includes(status)) return

        // start ingesting in new process.
        const ingestPath = path.join(__dirname, '../ingest/index.js');
        const childProcess = spawn('node', [ingestPath, scheduledGame.gamePk], {
          // detatch and reroute stdio to file so killing this process wont kill children.
          detached: true,
          stdio: [ 'ignore', out, err ]
        });
        // unref because this process should not wait for children to exit
        childProcess.unref();

        console.info(`${new Date()} - Ingesting game: ${scheduledGame.gamePk} in pid: ${childProcess.pid}`);
      });
    })
  } catch (err) {
    console.error(err);
  }
}

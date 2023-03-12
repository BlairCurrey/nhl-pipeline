import { CronJob } from 'cron';
import { Game } from '../../repositories/db/models/Game';
import { NhlApiClient } from '../../repositories/NhlApiClient';
import { spawn } from 'child_process';
import * as path from 'path';
import fs from 'fs';


export interface MonitorDeps {
  cronJob: typeof CronJob
  updateGames: (deps: UpdateGameDeps) => Promise<void>
  gameModel: typeof Game
  nhlApiClient: typeof NhlApiClient
};

export async function monitor(cronString: string, deps: MonitorDeps) {  
  const { cronJob, updateGames, gameModel, nhlApiClient } = deps;
  
  console.info(`${new Date()} - Starting NHL Schedule Monitor`);
  
  const updateGamesFn = async () => {
    await updateGames({ gameModel, nhlApiClient });
  };
  
  // run immediately then schedule cron job
  await updateGamesFn();
  new cronJob(cronString, updateGamesFn, null, true, 'America/New_York');
}

interface UpdateGameDeps {
  gameModel: typeof Game
  nhlApiClient: typeof NhlApiClient
}

export async function updateGames(deps: UpdateGameDeps){
  const { gameModel, nhlApiClient } = deps;
  try{
    console.info(`${new Date()} - Starting updateGame job`);
    // Get rolling window of games (yesterday through tomorrow).
    // Window avoids potential issues with day boundaries such  as not
    // updating game status that started before midnight and ended after midnight
    const dates = await nhlApiClient.getSchedule();
    const out = fs.openSync('./out.log', 'a');
    const err = fs.openSync('./out.log', 'a');

    dates.forEach((date: any) => {
      console.info(`${new Date()} - Checking ${date?.games?.length ?? 0} games`);
      date?.games.forEach(async (scheduledGame: any) => {
        // For each game, save the game if not found or update the status and push newly live games to queue
        const currentStatus = scheduledGame.status.abstractGameState;
        const foundGame = await gameModel.getById(scheduledGame.gamePk);

        // do nothing if game was previously seen and is unchanged
        if(foundGame && currentStatus === foundGame.status) return

        if(!foundGame){
          // save newly seen games
          console.info(`${new Date()} - Adding game ${scheduledGame.gamePk} to the database`);
          const game = new gameModel({ id: scheduledGame.gamePk, status: currentStatus });
          await game.save();
        } else {
          // update status of previously seen games
          console.info(`${new Date()} - Updating ${scheduledGame.gamePk} status to ${currentStatus}`);
          foundGame.status =  currentStatus;
          await foundGame.update();
        };

        if(currentStatus === 'Live'){
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
        }
      });
    })
  } catch (err) {
    console.error(err);
  }
}

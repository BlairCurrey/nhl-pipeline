import { CronJob } from 'cron'
import { Game } from '../../repositories/db/models/Game';
import { NhlApiClient } from '../../repositories/NhlApiClient';

const ingestorJobs: any = {};

export function monitor(cronString: string) {
  console.info(`${new Date()} - Starting NHL Schedule Monitor`);
  const cronJob = new CronJob(cronString, updateGames);
  cronJob.start();
}

export async function updateGames(){
  try{
    console.info(`${new Date()} - Starting updateGame job`);
    const games = await NhlApiClient.getTodaysGames();
  
    games.forEach(async (g: any) => {
      const foundGame = await Game.getById(g.gamePk)
      if(!foundGame){
        const game = new Game({id: g.gamePk, status: g.status.abstractGameState})
        await game.save()
        console.info(`${new Date()} - Adding game ${g.gamePk} to the database`);
      } else if (g.status.abstractGameState === "Live" && foundGame.status !== "Live") {
        foundGame.status = g.status.abstractGameState
        await foundGame.save()
        console.info(`${new Date()} - Game ${g.gamePk} is now live`);
        // start ingestor
        // const ingestorJob = 
        // store ingestor
        // ingestorJobs[foundGame.id] = ingestorJob
      } else if (g.status.abstractGameState === "Final" && foundGame.status !== "Final"){
        ingestorJobs[foundGame.id].stop()
      }
    });
  } catch (err) {
    console.error(err)
  }
}

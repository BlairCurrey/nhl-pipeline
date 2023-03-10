import { CronJob } from 'cron'
import { Game } from '../../repositories/db/models/Game';
import { NhlApiClient } from '../../repositories/NhlApiClient';
import { Redis } from '../../repositories/Redis';


export function monitor(cronString: string) {
  console.info(`${new Date()} - Starting NHL Schedule Monitor`);
  const cronJob = new CronJob(cronString, updateGames);
  cronJob.start();
}

export async function updateGames(){
  const redis = new Redis();
  try{
    console.info(`${new Date()} - Starting updateGame job`);
    const games = await NhlApiClient.getTodaysGames();
  
    games.forEach(async (g: any) => {
      const foundGame = await Game.getById(g.gamePk);
      if(!foundGame){
        const game = new Game({id: g.gamePk, status: g.status.abstractGameState});
        await game.save();
        console.info(`${new Date()} - Added game ${g.gamePk} to the database`);
      } else if (g.status.abstractGameState === "Live" && foundGame.status !== "Live") {
        foundGame.status = g.status.abstractGameState;
        await foundGame.update();
        await redis.enqueue(foundGame.id);
        console.info(`${new Date()} - Game ${foundGame.id} is now live`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

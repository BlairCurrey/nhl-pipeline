import { CronJob } from 'cron';
import { Game } from '../../repositories/db/models/Game';
import { NhlApiClient } from '../../repositories/NhlApiClient';
import { Redis } from '../../repositories/Redis';


export interface MonitorDeps {
  cronJob: typeof CronJob
  updateGames: (deps: UpdateGameDeps) => Promise<void>
  redisRepository: typeof Redis
  gameRepository: typeof Game
  nhlApiClient: typeof NhlApiClient
};

export async function monitor(cronString: string, deps: MonitorDeps) {  
  const { cronJob, updateGames, redisRepository, gameRepository, nhlApiClient } = deps;
  
  console.info(`${new Date()} - Starting NHL Schedule Monitor`);
  
  const updateGamesFn = async () => {
    await updateGames({
      redisRepository: redisRepository,
      gameRepository: gameRepository,
      nhlApiClient: nhlApiClient
    });
  };
  
  // run immediately then schedule cron job
  await updateGamesFn();
  new cronJob(cronString, updateGamesFn, null, true, 'America/New_York');
}

interface UpdateGameDeps {
  redisRepository: typeof Redis
  gameRepository: typeof Game
  nhlApiClient: typeof NhlApiClient
}

export async function updateGames(deps: UpdateGameDeps){
  const { redisRepository, gameRepository, nhlApiClient } = deps;
  const redis = new redisRepository();
  try{
    console.info(`${new Date()} - Starting updateGame job`);
    // Get rolling window of games (yesterday through tomorrow).
    // Window avoids potential issues with day boundaries such  as not
    // updating game status that started before midnight and ended after midnight
    const dates = await nhlApiClient.getSchedule();

    dates.forEach((date: any) => {
      date?.games.forEach(async (scheduledGame: any) => {
        // For each game, save the game if not found or update the status and push newly live games to queue
        const scheduledGameStatus = scheduledGame.status.abstractGameState;
        const foundGame = await gameRepository.getById(scheduledGame.gamePk);
        // save the game
        if(!foundGame){
          const game = new gameRepository({ id: scheduledGame.gamePk, status: scheduledGameStatus });
          await game.save();
          console.info(`${new Date()} - Added game ${scheduledGame.gamePk} to the database`);
        } else if (scheduledGameStatus !== foundGame.status) {
          // update the status
          foundGame.status =  scheduledGameStatus;
          await foundGame.update();

          if (scheduledGameStatus === "Live"){
            // push newly live game to queue.
            // worker will watch this queue and spawn ingestors
            await redis.enqueue(foundGame.id);
            console.info(`${new Date()} - Game ${foundGame.id} is now live`);
          }
        };
      });
    })
  } catch (err) {
    console.error(err);
  } finally {
    await redis.client.quit();
  }
}
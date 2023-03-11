import { CronJob } from 'cron';
import { Game } from '../../repositories/db/models/Game';
import { NhlApiClient } from '../../repositories/NhlApiClient';


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

    dates.forEach((date: any) => {
      console.info(`${new Date()} - Checking ${date?.games?.length ?? 0} games`);
      date?.games.forEach(async (scheduledGame: any) => {
        // For each game, save the game if not found or update the status and push newly live games to queue
        const scheduledGameStatus = scheduledGame.status.abstractGameState;
        const foundGame = await gameModel.getById(scheduledGame.gamePk);
        // save the game
        if(!foundGame){
          console.info(`${new Date()} - Adding game ${scheduledGame.gamePk} to the database`);
          const game = new gameModel({ id: scheduledGame.gamePk, status: scheduledGameStatus });
          await game.save();
        } else if (scheduledGameStatus !== foundGame.status) {
          // update the status
          console.info(`${new Date()} - Updating ${scheduledGame.gamePk} status to ${scheduledGameStatus}`);
          foundGame.status =  scheduledGameStatus;
          await foundGame.update();

          if (scheduledGameStatus === "Live"){
            // push newly live game to queue.
            // worker will watch this queue and spawn ingestors
            console.info(`${new Date()} - Game ${foundGame.id} queued`);
          }
        };
      });
    })
  } catch (err) {
    console.error(err);
  }
}
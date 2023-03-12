import { GameStat } from "../../repositories/db/models/GameStat";
import { NhlApiClient } from "../../repositories/NhlApiClient";
import { parseGameData } from "./parseGameData";

interface IngestDeps {
  gameStatModel: typeof GameStat
  nhlApiClient: typeof NhlApiClient
}

export async function ingest(gameId: string, deps: IngestDeps) {
  const { nhlApiClient, gameStatModel } = deps;
  console.info(`${new Date()} - Starting ingestion of gameId: ${gameId}`);

  const updateGameData = async() => {
    let status
    let gs
    
    try {
      const data = await nhlApiClient.getGameData(gameId);
      status = data?.gameData?.status?.abstractGameState
      const gameStats = parseGameData(data);

      gs = gameStats

      await gameStatModel.batchUpsert(gameStats)

    } catch (error) {
      console.error(`${new Date()} - Error occurred: ${error}`)
      console.info(JSON.stringify(gs, null, 2));
    }

    if (status === 'Final') {
      console.info(`${new Date()} - Status is final, exiting`);
      process.exit(0)
    }
  }

  // poll data every 10 seconds until game is over
  // may be able to reduce this interval, but want to avoid over-polling
  await updateGameData();
  setInterval(updateGameData, 10_000);
}

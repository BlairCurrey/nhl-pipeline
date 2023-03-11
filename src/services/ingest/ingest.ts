import { GameStat } from "../../repositories/db/models/GameStat";
import { NhlApiClient } from "../../repositories/NhlApiClient";
import { parseGameData } from "./parseGameData";

interface IngestDeps {
  gameStatModel: typeof GameStat
  nhlApiClient: typeof NhlApiClient
}

export async function ingest(gameId: string, deps: IngestDeps) {
  const { nhlApiClient, gameStatModel } = deps;
  console.info(`Starting ingestion of gameId: ${gameId}`);

  const updateGameData = async() => {
    try {
      const data = await nhlApiClient.getGameData(gameId);
      const gameStats = parseGameData(data);

      await gameStatModel.batchUpsert(gameStats)

      const { abstractGameState } = data?.gameData?.status ?? {}
      if (abstractGameState === 'Final') {
        console.info('Status is final, exiting');
        process.exit(0)
      }
    } catch (error) {
      console.error(`Error occurred: ${error}`);
    }
  }

  // poll for data every 10 seconds until game is over
  // may be able to reduce this interval, but want to avoid over-polling
  await updateGameData();
  setInterval(updateGameData, 10_000);
}

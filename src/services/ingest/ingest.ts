import { GameStat } from "../../repositories/db/models/GameStat";
import { NhlApiClient } from "../../repositories/NhlApiClient";
import { parseGameData } from "./parseGameData";
import process from 'process';

interface IngestDeps {
  gameStatModel: typeof GameStat
  nhlApiClient: typeof NhlApiClient
}

export async function ingest(gameId: number, deps: IngestDeps) {
  const { nhlApiClient, gameStatModel } = deps;
  console.info(`${new Date()} - Updating gameId: ${gameId} on pid: ${process.pid}`);
  
  try {
    const data = await nhlApiClient.getGameData(gameId);
    const gameStats = parseGameData(data);
    await gameStatModel.batchUpsert(gameStats)
  } catch (error) {
    console.error(`${new Date()} - Error occurred: ${error}`)
  }
  
  process.exit(0);
}

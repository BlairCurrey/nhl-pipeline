import { ingest } from './ingest'
import { GameStat } from "../../repositories/db/models/GameStat";
import { NhlApiClient } from "../../repositories/NhlApiClient";

// Script should be started with gameId as first arg
// Example: node dist/src/services/ingest/index.js 2022021037
const GAME_ID = parseInt(process.argv[2])
if(Number.isNaN(GAME_ID)) {
  console.error('Must provide integer gameId');
  process.exit(1);
}

ingest(GAME_ID, { gameStatModel: GameStat, nhlApiClient: NhlApiClient });
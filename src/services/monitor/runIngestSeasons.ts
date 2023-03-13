import { ingestSeasons } from '.'
import { NhlApiClient } from '../../repositories/NhlApiClient';
import { updateGames } from ".";

// Script should be started with at least one season as an arg
// Example: node dist/src/services/schedule/getPastSeasons.js 20212022
// Example of multiple: node dist/src/services/schedule/getPastSeasons.js 20202021 20212022
// Note:
//  This will spawn a new (short-lived) process for each game for all seasons provided. 
//  There is a 500ms delay by default. This can be increased in the updateGame functions if required.
//  May take ~10 minutes per season with 500ms delay.
const SEASONS = process.argv.slice(2);

if(!SEASONS.length) {
  console.error('Must specify seasons to ingest');
  process.exit(1);
}

const invalidSeasons = NhlApiClient.findInvalidSeasons(SEASONS)
if(invalidSeasons.length) {
  console.error(`Invalid seaons(s): ${invalidSeasons}. Should follow format: YYYYYYYY \n For example: 20212022`);
  process.exit(1);
}

ingestSeasons(SEASONS, {
  updateGames,
  nhlApiClient: NhlApiClient
})
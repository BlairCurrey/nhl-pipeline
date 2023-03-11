import { CronJob } from 'cron'
import { Game } from './repositories/db/models/Game';
import { NhlApiClient } from './repositories/NhlApiClient';
import { Redis } from './repositories/Redis';
import { monitor, updateGames } from "./services/monitor";

// Every minute between 10am-3:59AM and between September-May
// https://crontab.guru/#0_0-3,10-23_*_1-5,9-12_*
monitor('0 * 0-3,10-23 * 0-4,8-11 *', {
  cronJob: CronJob,
  updateGames,
  redisRepository: Redis,
  gameModel: Game,
  nhlApiClient: NhlApiClient
});

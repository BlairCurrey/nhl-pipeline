import { CronJob } from 'cron'
import { NhlApiClient } from './repositories/NhlApiClient';
import { monitor, updateGames } from "./services/monitor";

// Every 10 seconds between 10am-3:59AM and between September-May
// https://crontab.guru/#0_0-3,10-23_*_1-5,9-12_*
monitor('*/10 * 0-3,10-23 * 0-4,8-11 *', {
  cronJob: CronJob,
  updateGames,
  nhlApiClient: NhlApiClient
});

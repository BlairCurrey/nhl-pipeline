import { CronJob } from 'cron';
import { monitor, updateGames } from './';

jest.mock('cron');

describe('monitor', () => {
  it('should create a CronJob with the correct arguments and call start', () => {
    const cronString = '0 * 0-3,10-23 * 0-4,8-11 *'
    monitor(cronString);
    const [[, callback]] = (CronJob as jest.Mock).mock.calls;

    expect(CronJob).toHaveBeenCalledWith(cronString, expect.any(Function));
    expect(callback).toEqual(updateGames);
  });
});
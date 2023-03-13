import { NhlApiClient } from '../../repositories/NhlApiClient';
import { monitor, updateGames } from '.';


describe('monitor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a CronJob with the correct arguments and call start', async () => {
    const cronString = '0 * 0-3,10-23 * 0-4,8-11 *'
    const mockDeps = {
      cronJob: jest.fn(),
      updateGames: jest.fn(),
      gameModel: jest.fn(),
      nhlApiClient: jest.fn()
    };
    await monitor(cronString, mockDeps as any);
    expect(mockDeps.cronJob).toHaveBeenCalledWith(cronString, expect.any(Function), null, true, "America/New_York");
  });

  it('should save newly seen games to the database', async () => {
    jest.spyOn(NhlApiClient, 'getSchedule').mockImplementationOnce(async () => {
      return [{
        date: '2022-03-10',
        games: [
          {
            gamePk: '1',
            status: {
              abstractGameState: 'Final',
            },
          },
          {
            gamePk: "2",
            status: {
              abstractGameState: 'Preview',
            },
          },
        ],
      }]
    })

    await updateGames(["Live"], { nhlApiClient: NhlApiClient });
    expect(NhlApiClient.getSchedule).toHaveBeenCalled();
  });
});
import { monitor, ingestSeasons, updateGames } from '.';
import { spawn } from 'child_process';


describe('schedule', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('monitor', () => {
    it('should create a CronJob with the correct arguments and call start', async () => {
      const cronString = '0 * 0-3,10-23 * 0-4,8-11 *'
      const mockDeps = {
        cronJob: jest.fn(),
        updateGames: jest.fn(),
        gameModel: jest.fn(),
        nhlApiClient: { getScheduleToday: jest.fn() }
      };
      await monitor(cronString, mockDeps as any);
      expect(mockDeps.nhlApiClient.getScheduleToday).toHaveBeenCalledTimes(1);
      expect(mockDeps.cronJob).toHaveBeenCalledWith(cronString, expect.any(Function), null, true, "America/New_York");
    });
  })

  it('should call spawn for each game that matches status', async () => {
    const dates = [
      { games: [{ gamePk: '123', status: { abstractGameState: 'Final' } }] },
      { games: [{ gamePk: '124', status: { abstractGameState: 'Final' } }] },
      { games: [{ gamePk: '124', status: { abstractGameState: 'Live' } }] },
      { games: [{ gamePk: '124', status: { abstractGameState: 'Preview' } }] }
    ];
    const mockSpawn = jest.fn(() => ({ unref: jest.fn()}))
    
    await updateGames(dates, ['Live', 'Final'], { spawn: mockSpawn } as any);
    
    expect(mockSpawn).toHaveBeenCalledTimes(3);
  });

  describe('ingestSeasons', () => {
    it('should request schedule for seasons and start updateGames with dates and Final status', async () => {
      const mockDates = [{ date: '03/09/2023' }, { date: '03/10/2023' }]
      const mockDeps = {
        updateGames: jest.fn(),
        nhlApiClient: { getScheduleSeasons: jest.fn(() => mockDates) }
      };
      const seasons = ['2021','2022','2023']
      await ingestSeasons(seasons, mockDeps as any);
      expect(mockDeps.nhlApiClient.getScheduleSeasons).toHaveBeenCalledTimes(1);
      expect(mockDeps.nhlApiClient.getScheduleSeasons).toHaveBeenCalledWith(seasons);
      expect(mockDeps.updateGames).toHaveBeenCalledTimes(1);
      expect(mockDeps.updateGames).toHaveBeenCalledWith(mockDates, ['Final'], { spawn });
    });
  })
});
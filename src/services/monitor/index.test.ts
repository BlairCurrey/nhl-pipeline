import { Game } from '../../repositories/db/models/Game';
import { NhlApiClient } from '../../repositories/NhlApiClient';
import { Redis } from '../../repositories/Redis';
import { monitor, updateGames } from './';


describe('monitor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a CronJob with the correct arguments and call start', async () => {
    const cronString = '0 * 0-3,10-23 * 0-4,8-11 *'
    const mockDeps = {
      cronJob: jest.fn(),
      updateGames: jest.fn(),
      redisRepository: jest.fn(),
      gameRepository: jest.fn(),
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

    jest.spyOn(Game, 'getById').mockImplementation(async () => {
      return null
    })
    jest.spyOn(Game.prototype, 'save').mockImplementation(async () => {
      return {id: '1', status: 'Final'}
    })
    jest.spyOn(Game.prototype, 'update').mockImplementation(async () => {
      return 1
    })

    await updateGames({
      nhlApiClient: NhlApiClient,
      gameRepository: Game as any,
      redisRepository: Redis,
    });
    expect(NhlApiClient.getSchedule).toHaveBeenCalled();
    expect(Game.getById).toHaveBeenCalledWith('1');
    expect(Game.getById).toHaveBeenCalledWith('2');
    expect(Game.prototype.save).toBeCalledTimes(2)
    expect(Game.prototype.update).toBeCalledTimes(0)
  });
});
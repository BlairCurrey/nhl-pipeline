import { NhlApiClient } from './';
import season20202021 from '../../test/responses/season20202021.json'
import season20212022 from '../../test/responses/season20212022.json'


describe('', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('can get schedule for today', async () => {
    const mockedDates: any[] = [];
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({dates: mockedDates}),
      } as Response)
    );
    jest.spyOn(NhlApiClient, 'scheduleTodayUrl');

    await NhlApiClient.getScheduleToday();
    const schedule = await NhlApiClient.getScheduleToday();
    
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(NhlApiClient.scheduleTodayUrl).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(NhlApiClient.scheduleTodayUrl());
    expect(schedule).toBe(mockedDates);
  });

  it('can get schedule for seasons', async () => {
    const mockedDates: any[] = [season20202021, season20212022];

    const mockFetch = jest.fn();
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ json: () => Promise.resolve(mockedDates[0])})
    );
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ json: () => Promise.resolve(mockedDates[1])})
    );
    global.fetch = mockFetch;

    jest.spyOn(NhlApiClient, 'scheduleSeasonUrl');
    jest.spyOn(NhlApiClient, 'findInvalidSeasons');

    const seasons = ['20202021', '20212022'];
    const dates = await NhlApiClient.getScheduleSeasons(seasons);

    expect(global.fetch).toHaveBeenCalledTimes(seasons.length);
    expect(NhlApiClient.scheduleSeasonUrl).toHaveBeenCalledTimes(seasons.length);
    expect(NhlApiClient.findInvalidSeasons).toHaveBeenCalledWith(seasons);
    expect(dates.length).toEqual(mockedDates[0].dates.length + mockedDates[1].dates.length);

    (global.fetch as jest.Mock).mockRestore();
  });

  it('throw error if any date is invalid', async () => {
    const mockedDates: any[] = [];
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({dates: mockedDates}),
      } as Response)
    );

    const invalidSeasons = ['2021', '2022']
    try{
      await NhlApiClient.getScheduleSeasons(invalidSeasons)
    } catch (err) {
      if (err instanceof Error){
        expect(err.message).toBe(`Invalid seasons: ${invalidSeasons}`)
      } else {
        throw err
      }
    }
  });

  describe('isInvalidSeasonFormat', () => {
    it('returns true for seasons with incorrect length', () => {
      const invalidSeason = '2021';
      expect(NhlApiClient.isInvalidSeasonFormat(invalidSeason)).toBe(true);
    });

    it('returns false for seasons with correct length', () => {
      const validSeason = '20212022';
      expect(NhlApiClient.isInvalidSeasonFormat(validSeason)).toBe(false);
    });
  });

  describe('findInvalidSeasons', () => {
    it('returns empty array for list of valid seasons', () => {
      const validSeasons = ['20202021', '20212022', '20222023'];
      expect(NhlApiClient.findInvalidSeasons(validSeasons)).toEqual([]);
    });

    it('returns array of invalid seasons for list of mixed seasons', () => {
      const mixedSeasons = ['20202021', '20212022', '2122', '20222324', ''];
      expect(NhlApiClient.findInvalidSeasons(mixedSeasons)).toEqual(['2122', '']);
    });

    it('returns all seasons if all are invalid', () => {
      const invalidSeasons = ['2122', '2324', '201', '23', ''];
      expect(NhlApiClient.findInvalidSeasons(invalidSeasons)).toEqual(invalidSeasons);
    });
  });
});
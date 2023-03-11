import { NhlApiClient } from './';


describe('', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('can get schedule', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({dates: []}),
      } as Response)
    );
    jest.spyOn(NhlApiClient, 'scheduleUrl');

    await NhlApiClient.getSchedule();
    await NhlApiClient.getSchedule();
    
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(NhlApiClient.scheduleUrl).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(NhlApiClient.scheduleUrl());
  });
});
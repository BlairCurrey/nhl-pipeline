import { yesterdayDate, tomorrowDate } from "../../lib/utils";

export class NhlApiClient {
  static scheduleTodayUrl = () => `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${yesterdayDate()}&endDate=${tomorrowDate()}`;
  static scheduleSeasonUrl = (season: string) => `https://statsapi.web.nhl.com/api/v1/schedule?season=${season}`;
  
  static async getScheduleToday(): Promise<any[]> {
    const url = NhlApiClient.scheduleTodayUrl()
    const res = await fetch(url);
    const schedule = await res.json();

    if(!schedule?.dates) {
      const msg = `Could not find dates for request: ${url}`;
      console.warn(msg, {schedule});
      throw new Error(msg);
    }

    return schedule.dates
  }

  static async getScheduleSeasons(seasons: string[]): Promise<any[]> {
    const invalidSeasons = NhlApiClient.findInvalidSeasons(seasons)
    if (invalidSeasons.length){
      throw new Error(`Invalid seasons: ${invalidSeasons}`)
    }

    let dates: any[] = [];

    for (const season of seasons) {
      const url = NhlApiClient.scheduleSeasonUrl(season);
      const res = await fetch(url);
      const schedule = await res.json();
      dates = dates.concat(schedule.dates)
    }

    return dates
  }
  
  static isInvalidSeasonFormat(season: string) {
    return season.length != 8
  }

  static findInvalidSeasons(seasons: string[]) {
    return seasons.filter(season => NhlApiClient.isInvalidSeasonFormat(season));
  }

  static async getGameData(gameId: number) {
    const gameDataUrl = `https://statsapi.web.nhl.com/api/v1/game/${gameId}/feed/live`;
    const res = await fetch(gameDataUrl);
    return await res.json();
  }
}
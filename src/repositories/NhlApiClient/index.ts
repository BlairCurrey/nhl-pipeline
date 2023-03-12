import { yesterdayDate, tomorrowDate } from "../../lib/utils";

export class NhlApiClient {
  static scheduleUrl = () => `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${yesterdayDate()}&endDate=${tomorrowDate()}`;
  
  static async getSchedule(): Promise<any[]> {
    const url = NhlApiClient.scheduleUrl()
    const res = await fetch(url);
    const schedule = await res.json();

    if(!schedule?.dates) {
      const msg = `Could not find dates for request: ${url}`;
      console.warn(msg, {schedule});
      throw new Error(msg);
    }

    return schedule.dates
  }
  
  static async getGameData(gameId: number) {
    const gameDataUrl = `https://statsapi.web.nhl.com/api/v1/game/${gameId}/feed/live`;
    const res = await fetch(gameDataUrl);
    return await res.json();
  }
}
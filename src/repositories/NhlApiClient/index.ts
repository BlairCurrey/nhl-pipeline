import { dateNowEST } from "../../utils";

export class NhlApiClient {
  static async getTodaysGames() {
    const scheduleUrl = `https://statsapi.web.nhl.com/api/v1/schedule?date=${dateNowEST()}`;
    const res = await fetch(scheduleUrl);
    const schedule = await res.json();

    if(!schedule?.dates?.[0]?.games) {
      const msg = 'Could not find games'
      console.warn(msg, {schedule})
      throw new Error(msg);
    }

    return schedule.dates[0].games
  }
}
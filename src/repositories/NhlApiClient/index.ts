import { yesterdayDate, tomorrowDate } from "../../utils";

export class NhlApiClient {
  static scheduleUrl = `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${yesterdayDate()}&endDate=${tomorrowDate()}`;
  
  static async getSchedule() {
    const res = await fetch(NhlApiClient.scheduleUrl);
    const schedule = await res.json();

    if(!schedule?.dates) {
      const msg = `Could not find dates for request: ${NhlApiClient.scheduleUrl}`;
      console.warn(msg, {schedule});
      throw new Error(msg);
    }

    return schedule.dates
  }
}
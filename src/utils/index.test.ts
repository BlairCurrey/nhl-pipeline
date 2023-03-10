import { yesterdayDate, tomorrowDate } from "./";
import { DateTime } from "luxon";

describe("utils", () => {
  describe("yesterdayDate", () => {
    it("should return the date for yesterday", () => {
      const cases = [
        {
          // start of day boundary
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 15,
            hour: 0,
            minute: 0,
            second: 0,
          }, 
          { zone: "America/New_York" }),
          expected: "2023-03-14"
        },
        {
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 15,
            hour: 12,
            minute: 0,
            second: 0,
          }, 
          { zone: "America/New_York" }),
          expected: "2023-03-14"
        },
        {
          // end of day boundary
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 15,
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999
          }, 
          { zone: "America/New_York" }),
          expected: "2023-03-14"
        },
        {
          // beginning of month boundary
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 1,
            hour: 12,
            minute: 0,
            second: 0,
            millisecond: 0
          }, 
          { zone: "America/New_York" }),
          expected: "2023-02-28"
        },
      ];
    
      cases.forEach(c => {
        jest.spyOn(DateTime, "now").mockReturnValue(c.now.toUTC());
        const result = yesterdayDate();
        expect(result).toBe(c.expected);
        jest.restoreAllMocks();
      });
    });
  });

  describe("tomorrowDate", () => {
    it("should return the date for tomorrow", () => {
      const cases = [
        {
          // start of day boundary
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 15,
            hour: 0,
            minute: 0,
            second: 0,
          }, 
          { zone: "America/New_York" }),
          expected: "2023-03-16"
        },
        {
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 15,
            hour: 12,
            minute: 0,
            second: 0,
          }, 
          { zone: "America/New_York" }),
          expected: "2023-03-16"
        },
        {
          // end of day boundary
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 15,
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999
          }, 
          { zone: "America/New_York" }),
          expected: "2023-03-16"
        },
        {
          // end of month boundary
          now: DateTime.fromObject({
            year: 2023,
            month: 3,
            day: 31,
            hour: 12,
            minute: 0,
            second: 0,
            millisecond: 0
          }, 
          { zone: "America/New_York" }),
          expected: "2023-04-01"
        },
      ];
    
      cases.forEach(c => {
        jest.spyOn(DateTime, "now").mockReturnValue(c.now.toUTC());
        const result = tomorrowDate();
        expect(result).toBe(c.expected);
        jest.restoreAllMocks();
      });
    });
  });
});




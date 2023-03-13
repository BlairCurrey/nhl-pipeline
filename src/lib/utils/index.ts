import { DateTime } from 'luxon';

export type NonEmptyArray<T> = [T, ...T[]]

export function yesterdayDate() {
  return DateTime.now().setZone("America/New_York").minus({ days: 1 }).toISODate()
}

export function tomorrowDate() {
  return DateTime.now().setZone("America/New_York").plus({ days: 1 }).toISODate()
}

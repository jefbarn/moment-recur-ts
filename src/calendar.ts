import { Rule } from './rule'
import * as moment from 'moment'

/**
 * @internal
 * @hidden
 */
export type CalendarMeasure =
  'daysOfWeek'
  | 'daysOfMonth'
  | 'weeksOfMonth'
  | 'weeksOfMonthByDay'
  | 'weeksOfYear'
  | 'monthsOfYear'

/**
 * Calendar object for creating and matching calendar-based rules
 * @internal
 * @hidden
 */
export class Calendar implements Rule {

  private static readonly ranges: {
    [key: string]: {
      period: moment.unitOfTime.Base
      range: moment.unitOfTime.Base
      low: number
      high: number
    }
  } = {
    daysOfWeek: {
      period: 'day',
      range: 'week',
      low: 0,
      high: 6
    },
    daysOfMonth: {
      period: 'day',
      range: 'month',
      low: 1,
      high: 31
    },
    weeksOfMonth: {
      period: 'week',
      range: 'month',
      low: 0,
      high: 4
    },
    weeksOfMonthByDay: {
      period: 'week',
      range: 'month',
      low: 0,
      high: 4
    },
    weeksOfYear: {
      period: 'week',
      range: 'year',
      low: 0,
      high: 52
    },
    monthsOfYear: {
      period: 'month',
      range: 'year',
      low: 0,
      high: 11
    }
  }

  units: number[]
  measure: CalendarMeasure

  constructor (units: (string | number)[], measure: CalendarMeasure) {

    // Convert day/month names to numbers, if needed
    if (measure === 'daysOfWeek') {
      this.units = this.namesToNumbers(units, 'days')
    } else if (measure === 'monthsOfYear') {
      this.units = this.namesToNumbers(units, 'months')
    } else {
      this.units = units.map(unit => {
        unit = +unit
        if (Number.isInteger(unit)) {
          return unit
        } else {
          throw new TypeError('Invalid calendar unit in recurrence: ' + unit)
        }
      })
    }
    this.units.sort((a, b) => a - b)

    this.measure = measure

    // Make sure the listed units are in the measure's range
    this.checkRange()
  }

  match (date: moment.Moment): boolean {

    // Get the unit based on the required measure of the date
    let unit = this.periodUnit(date)

    // If the unit is in our list, return true, else return false
    if (this.units.includes(unit)) {
      return true
    }

    // match on end of month days
    if (this.measure === 'daysOfMonth') {
      if (moment(date).endOf('month').date() === unit) {
        return this.units.some(unit => unit >= 28)
      }
    }

    return false
  }

  next (currentDate: moment.Moment): moment.Moment {

    // If still within our period, just give the next day
    if (!this.isLastDayOfPeriod(currentDate)) {
      let nextDate = moment(currentDate).add(1, 'day')
      if (this.match(nextDate)) return nextDate
    }

    // Get the next period based on the measure
    let nextDate = this.nextPeriod(currentDate)
    if (nextDate) {
      return nextDate
    } else {
      // No more units found within this range,
      // bump our range by one and try again.
      currentDate = this.incrementRange(currentDate, 1)

      // Check to see if next range starts on a valid period
      if (this.match(currentDate)) {
        return currentDate
      }

      nextDate = this.nextPeriod(currentDate)

      /* istanbul ignore else */
      if (nextDate) {
        return nextDate
      } else {
        throw new Error('Could not determine next date for calendar recurrence.')
      }
    }
  }

  previous (currentDateIn: moment.Moment): moment.Moment {

    let currentDate = currentDateIn.clone()
    // If still within our period, just give the next day
    if (!this.isFirstDayOfPeriod(currentDate)) {
      let nextDate = moment(currentDate).subtract(1, 'day')
      if (this.match(nextDate)) return nextDate
    }

    // Get the next period based on the measure
    let nextDate = this.previousPeriod(currentDate)
    if (nextDate) {
      return nextDate
    } else {
      // No more units found within this range,
      // bump our range by one and try again.
      currentDate = this.decrementRange(currentDate, 1)

      // Check to see if next range starts on a valid period
      if (this.match(currentDate)) {
        return currentDate
      }

      nextDate = this.previousPeriod(currentDate)

      /* istanbul ignore else */
      if (nextDate) {
        return nextDate
      } else {
        throw new Error('Could not determine next date for calendar recurrence.')
      }
    }
  }

  // Private function for checking the range of calendar values
  private checkRange (): void {

    let low = Calendar.ranges[this.measure].low
    let high = Calendar.ranges[this.measure].high

    for (let unit of this.units) {
      if (unit < low || unit > high) {
        throw new RangeError('Value should be in range ' + low + ' to ' + high)
      }
    }
  }

  // Private function to convert day and month names to numbers
  private namesToNumbers (units: (string | number)[], nameType: 'days' | 'months'): number[] {

    return units.map(unit => {
      if (typeof unit === 'number') {
        return unit
      } else {
        return moment().set(nameType, unit).get(nameType)
      }
    })
  }

  private periodUnit (date: moment.Moment): number
  private periodUnit (date: moment.Moment, unit: number): moment.Moment
  private periodUnit (date: moment.Moment, unit?: number): number | moment.Moment {
    switch (this.measure) {
      case 'daysOfWeek':
        return date.day(unit!)
      case 'daysOfMonth':
        return date.date(unit!)
      case 'weeksOfMonth':
        return date.monthWeek(unit!)
      case 'weeksOfMonthByDay':
        return date.monthWeekByDay(unit!)
      case 'weeksOfYear':
        return date.week(unit!)
      case 'monthsOfYear':
        return date.month(unit!)
    }
  }

  private nextPeriod (date: moment.Moment): moment.Moment | undefined {
    let period = Calendar.ranges[this.measure].period

    // Get the next period based on the measure
    let currentUnit = this.periodUnit(date)
    if (this.measure === 'weeksOfYear' && date.month() === 0 && date.week() > 50) currentUnit = 1
    let nextUnit = this.units.find(unit => unit > currentUnit)
    if (nextUnit !== undefined) {
      return this.periodUnit(date.clone(), nextUnit).startOf(period)
    } else {

      // Weeks do not follow orderly periods, e.g. a year can begin and end on week 1
      if (this.measure === 'weeksOfYear' && this.units.includes(1)) {
        let nextDate = date.clone().endOf('year').startOf('week')
        if (nextDate.week() === 1) return nextDate
      }
      return undefined
    }
  }

  private previousPeriod (date: moment.Moment): moment.Moment | undefined {
    let period = Calendar.ranges[this.measure].period
    // Get the next period based on the measure
    let currentUnit = this.periodUnit(date)
    if (this.measure === 'weeksOfYear' && date.month() === 11 && date.week() === 1) currentUnit = 53
    let nextUnit = this.units.find(unit => unit < currentUnit)
    if (nextUnit !== undefined) {
      if (this.measure === 'weeksOfYear' && currentUnit === 53) date.week(0)
      return this.periodUnit(date.clone(), nextUnit).endOf(period)
    } else {

      // Weeks do not follow orderly periods, e.g. a year can begin and end on week 1
      if (this.measure === 'weeksOfYear' && this.units.includes(52) || this.units.includes(53)) {
        let nextDate = date.clone().startOf('year').endOf('week')
        if (nextDate.week() > 1) return nextDate
      }
      return undefined
    }
  }

  private incrementRange (date: moment.Moment, count: number): moment.Moment {
    let range = Calendar.ranges[this.measure].range
    return date.add(count, range).startOf(range)
  }

  private decrementRange (date: moment.Moment, count: number): moment.Moment {
    let range = Calendar.ranges[this.measure].range
    return date.subtract(count, range).endOf(range)
  }

  private isLastDayOfPeriod (date: moment.Moment): boolean {
    let period = Calendar.ranges[this.measure].period
    if (period === 'day') {
      return true
    } else {
      return date.isSame(moment(date).endOf(period))
    }
  }

  private isFirstDayOfPeriod (date: moment.Moment): boolean {
    let period = Calendar.ranges[this.measure].period
    if (period === 'day') {
      return true
    } else {
      return date.isSame(moment(date).startOf(period))
    }
  }
}

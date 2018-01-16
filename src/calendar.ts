import moment, { Moment } from 'moment'
import { Rule } from './rule'

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
 * @internal
 * @hidden
 */
type TimeUnits = 'day' | 'month' | 'week' | 'year'

interface RangeDef {
  period: TimeUnits
  range: TimeUnits
  low: number
  high: number
}

/**
 * Calendar object for creating and matching calendar-based rules
 * @internal
 * @hidden
 */
export class Calendar implements Rule {

  private static readonly ranges: Record<CalendarMeasure, RangeDef> = {
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
      low: 1,
      high: 53
    },
    monthsOfYear: {
      period: 'month',
      range: 'year',
      low: 0,
      high: 11
    }
  }

  public readonly units: number[]
  public readonly measure: CalendarMeasure

  private readonly range: TimeUnits
  private readonly period: TimeUnits

  constructor (units: (string | number)[], measure: CalendarMeasure) {

    this.measure = measure
    this.units = this.normalizeUnits(units)

    this.range = Calendar.ranges[this.measure].range
    this.period = Calendar.ranges[this.measure].period
  }

  public match (date: Moment): boolean {

    // Get the unit based on the required measure of the date
    const unit = this.periodUnit(date)

    // If the unit is in our list, return true, else return false
    if (this.units.indexOf(unit) !== -1) {
      return true
    }
    if ((this.units[0] === -1) &&
      (unit === this.periodUnit(moment(date).endOf(this.range)))) {
      return true
    }

    return false
  }

  public next (currentDateIn: Moment, limit: Moment): Moment {

    let currentDate = currentDateIn.clone()
    // If still within our period, just give the next day
    if (!this.isLastDayOfPeriod(currentDate)) {
      const nextDateInPeriod = moment(currentDate).add(1, 'day')
      if (this.match(nextDateInPeriod)) return nextDateInPeriod
    }

    while (true) {
      // Get the next period based on the measure
      const nextDate = this.nextPeriod(currentDate)
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

        if (currentDate.isSameOrAfter(limit)) {
          throw new RangeError('Recurrence Year limit exceeded.')
        }
      }
    }
  }

  public previous (currentDateIn: Moment, limit: Moment): Moment {

    let currentDate = currentDateIn.clone()
    // If still within our period, just give the next day
    if (!this.isFirstDayOfPeriod(currentDate)) {
      const nextDateInPeriod = moment(currentDate).subtract(1, 'day')
      if (this.match(nextDateInPeriod)) return nextDateInPeriod
    }

    while (true) {
      // Get the next period based on the measure
      const nextDate = this.previousPeriod(currentDate)
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

        if (currentDate.isSameOrBefore(limit)) {
          throw new RangeError('Recurrence Year limit exceeded.')
        }
      }
    }
  }

  private normalizeUnits (units: any[]): number[] {

    const low = Calendar.ranges[this.measure].low
    const high = Calendar.ranges[this.measure].high

    return units.map(unitIn => {
      if (unitIn === 'last') unitIn = -1
      if (typeof unitIn !== 'number') {
        // Convert day/month names to numbers, if needed
        if (this.measure === 'daysOfWeek') {
          unitIn = moment().set('days', unitIn).get('days')
        } else if (this.measure === 'monthsOfYear') {
          unitIn = moment().set('months', unitIn).get('months')
        } else {
          unitIn = +unitIn
        }
      }
      if (!Number.isInteger(unitIn)) {
        throw new TypeError('Invalid calendar unit in recurrence: ' + unitIn)
      }
      if ((unitIn < low || unitIn > high) && (unitIn !== -1)) {
        throw new RangeError('Value should be in range ' + low + ' to ' + high)
      }
      return unitIn
    }).sort((a, b) => a - b)
  }

  private periodUnit (date: Moment): number
  private periodUnit (date: Moment, unit: number): Moment
  private periodUnit (date: Moment, unit?: number): number | Moment {
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

  private nextPeriod (date: Moment): Moment | undefined {
    // Get the next period based on the measure
    const currentUnit = this.periodUnit(date)

    const nextUnit = this.units
      .map(unit => unit === -1 ? this.periodUnit(date.clone().endOf(this.range)) : unit)
      .find(unit => unit > currentUnit)

    if (nextUnit !== undefined) {
      return this.periodUnit(date.clone(), nextUnit).startOf(this.period)
    } else {

      // Weeks do not follow orderly periods, e.g. a year can begin and end on week 1
      if (this.measure === 'weeksOfYear' && (this.units.indexOf(1) !== -1)) {
        return date.clone().endOf('year').startOf('week')
      }
      return undefined
    }
  }

  private previousPeriod (date: Moment): Moment | undefined {
    // Get the next period based on the measure
    let currentUnit = this.periodUnit(date)
    if (this.measure === 'weeksOfYear' && date.month() === 11 && date.week() === 1) currentUnit = 53

    const nextUnit = this.units
      .map(unit => unit === -1 ? this.periodUnit(date.clone().endOf(this.range)) : unit)
      .reverse().find(unit => unit < currentUnit)

    if (nextUnit !== undefined) {
      if (this.measure === 'weeksOfYear' && currentUnit === 53) date.week(0)
      return this.periodUnit(date.clone(), nextUnit).endOf(this.period)
    } else {

      // Weeks do not follow orderly periods, e.g. a year can begin and end on week 1
      if (this.measure === 'weeksOfYear' &&
        this.units.some(u => 52 >= u && u <= 53)) {
        return date.clone().startOf('year').endOf('week')
      }
      return undefined
    }
  }

  private incrementRange (date: Moment, count: number): Moment {
    return date.add(count, this.range).startOf(this.range)
  }

  private decrementRange (date: Moment, count: number): Moment {
    return date.subtract(count, this.range).endOf(this.range)
  }

  private isLastDayOfPeriod (date: Moment): boolean {
    if (this.measure === 'weeksOfMonthByDay') {
      return date.monthWeekByDay() !== moment(date).add(1, 'day').monthWeekByDay()
    }

    if (this.period === 'day') {
      return true
    } else {
      return date.isSame(moment(date).endOf(this.period))
    }
  }

  private isFirstDayOfPeriod (date: Moment): boolean {
    if (this.measure === 'weeksOfMonthByDay') {
      return date.monthWeekByDay() !== moment(date).subtract(1, 'day').monthWeekByDay()
    }

    if (this.period === 'day') {
      return true
    } else {
      return date.isSame(moment(date).startOf(this.period))
    }
  }
}

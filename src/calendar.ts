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
    let unit = this.measureUnit(date)

    // If the unit is in our list, return true, else return false
    if (this.units.includes(unit)) {
      return true
    }

    // match on end of month days
    if (this.measure === 'daysOfMonth' && unit >= 28) {
      if (moment(date).endOf('month').date() === unit) {
        return true
      }
    }

    return false
  }

  next (currentDate: moment.Moment): moment.Moment {

    // Get the unit based on the required measure of the date
    let currentUnit = this.measureUnit(currentDate)
    let nextUnit = this.units.find(unit => unit > currentUnit)
    if (nextUnit !== undefined) {
      return this.measureUnit(currentDate, nextUnit)
    } else {
      // No more units found within this period,
      // bump our period by one and try again.
      currentDate = this.incrementPeriod(currentDate, 1)
      currentUnit = this.measureUnit(currentDate)
      nextUnit = this.units.find(unit => unit >= currentUnit)

      /* istanbul ignore else */
      if (nextUnit !== undefined) {
        return this.measureUnit(currentDate, nextUnit)
      } else {
        throw new Error('Could not determine next date for calendar recurrence.')
      }
    }
  }

  previous (currentDate: moment.Moment): moment.Moment {

    // Get the unit based on the required measure of the date
    let currentUnit = this.measureUnit(currentDate)
    let nextUnit = this.units.find(unit => unit < currentUnit)
    if (nextUnit !== undefined) {
      return this.measureUnit(currentDate, nextUnit)
    } else {
      // No more units found within this period,
      // bump our period by one and try again.
      currentDate = this.decrementPeriod(currentDate, 1)
      currentUnit = this.measureUnit(currentDate)
      nextUnit = this.units.find(unit => unit <= currentUnit)
      if (nextUnit !== undefined) {
        return this.measureUnit(currentDate, nextUnit)
      } else {
        throw new Error('Could not determine next date for calendar recurrence.')
      }
    }
  }

  // Private function for checking the range of calendar values
  private checkRange (): void {

    // Dictionary of ranges based on measures
    const ranges = {
      daysOfMonth: { low: 1, high: 31 },
      daysOfWeek: { low: 0, high: 6 },
      weeksOfMonth: { low: 0, high: 4 },
      weeksOfMonthByDay: { low: 0, high: 4 },
      weeksOfYear: { low: 0, high: 52 },
      monthsOfYear: { low: 0, high: 11 }
    }

    let low = ranges[this.measure].low
    let high = ranges[this.measure].high

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

  private measureUnit (date: moment.Moment): number
  private measureUnit (date: moment.Moment, unit: number): moment.Moment
  private measureUnit (date: moment.Moment, unit?: number): number | moment.Moment {
    switch (this.measure) {
      case 'daysOfWeek':
        return date.day(unit as number)
      case 'daysOfMonth':
        return date.date(unit as number)
      case 'weeksOfMonth':
        return date.monthWeek(unit as number)
      case 'weeksOfMonthByDay':
        return date.monthWeekByDay(unit as number)
      case 'weeksOfYear':
        return date.week(unit as number)
      case 'monthsOfYear':
        return date.month(unit as number)
    }
  }

  private incrementPeriod (date: moment.Moment, count: number): moment.Moment {
    switch (this.measure) {
      case 'daysOfWeek':
        return date.add(count, 'weeks').startOf('week')
      case 'daysOfMonth':
        return date.add(count, 'months').startOf('month')
      case 'weeksOfMonth':
        return date.add(count, 'months').startOf('month')
      case 'weeksOfMonthByDay':
        return date.add(count, 'months').startOf('month')
      case 'weeksOfYear':
        return date.add(count, 'year').startOf('year')
      case 'monthsOfYear':
        return date.add(count, 'year').startOf('year')
    }
  }

  private decrementPeriod (date: moment.Moment, count: number): moment.Moment {
    switch (this.measure) {
      case 'daysOfWeek':
        return date.subtract(count, 'weeks').endOf('week')
      case 'daysOfMonth':
        return date.subtract(count, 'months').endOf('month')
      case 'weeksOfMonth':
        return date.subtract(count, 'months').endOf('month')
      case 'weeksOfMonthByDay':
        return date.subtract(count, 'months').endOf('month')
      case 'weeksOfYear':
        return date.subtract(count, 'year').endOf('year')
      case 'monthsOfYear':
        return date.subtract(count, 'year').endOf('year')
    }
  }
}

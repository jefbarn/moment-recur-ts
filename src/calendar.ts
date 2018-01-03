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

    this.measure = measure

    // Make sure the listed units are in the measure's range
    this.checkRange()
  }

  match (date: moment.Moment) {

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

  // Private function for checking the range of calendar values
  private checkRange () {

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

  private measureUnit (date: moment.Moment): number {
    switch (this.measure) {
      case 'daysOfMonth':
        return date.date()
      case 'daysOfWeek':
        return date.day()
      case 'weeksOfMonth':
        return date.monthWeek()
      case 'weeksOfMonthByDay':
        return date.monthWeekByDay()
      case 'weeksOfYear':
        return date.week()
      case 'monthsOfYear':
        return date.month()
    }
  }

}

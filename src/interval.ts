import { Rule } from './rule'
import { Moment } from 'moment'

export type IntervalMeasure = 'days' | 'weeks' | 'months' | 'years'

// Interval object for creating and matching interval-based rules
export class Interval implements Rule {

  units: number[]
  measure: IntervalMeasure

  constructor (units: (string | number)[], measure: IntervalMeasure) {

    // Make sure all of the units are integers greater than 0.
    this.units = units.map(unit => {
      unit = +unit
      if (unit <= 0) {
        throw new Error('Intervals must be greater than zero.')
      }
      if (!Number.isInteger(unit)) {
        throw new Error('Intervals must be integers.')
      }
      return unit
    })

    this.measure = measure
  }

  match (date: Moment, start: Moment): boolean {

    let precise = this.measure !== 'days'
    let diff = Math.abs(start.diff(date, this.measure, precise))

    // Check to see if any of the units provided match the date
    for (let unit of this.units) {
      // If the units divide evenly into the difference, we have a match
      if ((diff % unit) === 0) {
        return true
      }
    }

    return false
  }

}

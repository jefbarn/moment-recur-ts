import { Rule } from './rule'
import { Moment } from 'moment'

/**
 * @internal
 * @hidden
 */
export type IntervalMeasure = 'days' | 'weeks' | 'months' | 'years'

/**
 * Interval object for creating and matching interval-based rules
 * @internal
 * @hidden
 */
export class Interval implements Rule {

  units: number[]
  measure: IntervalMeasure

  private start: Moment

  constructor (units: (string | number)[], measure: IntervalMeasure, start: Moment | null) {

    if (!start) {
      throw new Error('Must have a start date set to set an interval!')
    }
    this.start = start.clone()

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
    this.units.sort((a, b) => a - b)

    this.measure = measure
  }

  match (date: Moment): boolean {

    let precise = this.measure !== 'days'
    let diff = Math.abs(this.start.diff(date, this.measure, precise))

    // Check to see if any of the units provided match the date
    for (let unit of this.units) {
      // If the units divide evenly into the difference, we have a match
      if ((diff % unit) === 0) {
        return true
      }
    }

    return false
  }

  next (currentDate: Moment): Moment {

    // let precise = this.measure !== 'days'
    // Get the multiple of the start
    let diff = currentDate.diff(this.start, this.measure)

    // Find the next muliple for each unit
    let multiples = this.units.map(unit => (Math.floor(diff / unit) + 1) * unit)
    multiples.sort((a, b) => a - b)

    return this.start.add(multiples[0], this.measure)
  }

  previous (currentDate: Moment): Moment {

    // let precise = this.measure !== 'days'
    // Get the multiple of the start
    let diff = this.start.diff(currentDate, this.measure)

    // Find the next muliple for each unit
    let multiples = this.units.map(unit => (Math.floor(diff / unit) - 1) * unit)
    multiples.sort((a, b) => b - a)

    return this.start.add(multiples[0], this.measure)
  }
}

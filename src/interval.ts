import { Moment } from 'moment'
import { Rule } from './rule'

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

  public readonly units: number[]
  public readonly measure: IntervalMeasure

  private start: Moment

  constructor (units: (string | number)[], measure: IntervalMeasure, start: Moment | null) {

    if (!start) {
      throw new Error('Must have a start date set to set an interval!')
    }
    this.start = start.clone()

    this.measure = measure
    this.units = this.normalizeUnits(units)
  }

  public match (date: Moment): boolean {

    const precise = this.measure !== 'days'
    const diff = Math.abs(this.start.diff(date, this.measure, precise))

    // Check to see if any of the units provided match the date
    for (const unit of this.units) {
      // If the units divide evenly into the difference, we have a match
      if ((diff % unit) === 0) {
        return true
      }
    }

    return false
  }

  public next (currentDate: Moment): Moment {

    // let precise = this.measure !== 'days'
    // Get the multiple of the start
    const diff = currentDate.diff(this.start, this.measure)

    // Find the next muliple for each unit
    const multiples = this.units.map(unit => (Math.floor(diff / unit) + 1) * unit)
    multiples.sort((a, b) => a - b)

    return this.start.clone().add(multiples[0], this.measure)
  }

  public previous (currentDate: Moment): Moment {

    // let precise = this.measure !== 'days'
    // Get the multiple of the start
    const diff = this.start.diff(currentDate, this.measure)

    // Find the next muliple for each unit
    const multiples = this.units.map(unit => (Math.floor(diff / unit) + 1) * unit)
    multiples.sort((a, b) => b - a)

    return this.start.clone().subtract(multiples[0], this.measure)
  }

  private normalizeUnits (units: any[]): number[] {

    // Make sure all of the units are integers greater than 0.
    return units.map(unit => {
      unit = +unit
      if (unit <= 0) {
        throw new Error('Intervals must be greater than zero.')
      }
      if (!Number.isInteger(unit)) {
        throw new Error('Intervals must be integers.')
      }
      return unit
    }).sort((a, b) => a - b)
  }
}

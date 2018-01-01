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
    // Get the difference between the start date and the provided date,
    // using the required measure based on the type of rule'
    let diff: number
    if (date.isBefore(start)) {
      diff = start.diff(date, this.measure, true)
    } else {
      diff = date.diff(start, this.measure, true)
    }
    if (this.measure == 'days') {
      // if we are dealing with days, we deal with whole days only.
      diff = Math.floor(diff)  // TODO: should this even happen?
    }

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

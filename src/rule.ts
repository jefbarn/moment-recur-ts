import { Moment } from 'moment'
import { Interval } from './interval'
import { Calendar } from './calendar'

export type MeasureSingle =
  'day'
  | 'week'
  | 'month'
  | 'year'
  | 'dayOfWeek'
  | 'dayOfMonth'
  | 'weekOfMonth'
  | 'weekOfMonthByDay'
  | 'weekOfYear'
  | 'monthOfYear'

export type MeasurePlural =
  'days'
  | 'weeks'
  | 'months'
  | 'years'
  | 'daysOfWeek'
  | 'daysOfMonth'
  | 'weeksOfMonth'
  | 'weeksOfMonthByDay'
  | 'weeksOfYear'
  | 'monthsOfYear'

export type UnitsInput = string | number | (string | number)[] | UnitsObject | undefined | null

export interface UnitsObject {
  [unit: string]: boolean
  [unit: number]: boolean
}

export type MeasureInput = MeasureSingle | MeasurePlural | undefined | null

export interface Rule {

  units: number[]
  measure: MeasurePlural

  match (date: Moment, start?: Moment): boolean
}

export function ruleFactory (units: UnitsInput, measure: MeasureInput): Rule {

  let normMeasure = pluralize(measure)

  switch (normMeasure) {
    case 'days':
    case 'weeks':
    case 'months':
    case 'years':
      return new Interval(unitsToArray(units), normMeasure)

    case 'daysOfWeek':
    case 'daysOfMonth':
    case 'weeksOfMonth':
    case 'weeksOfMonthByDay':
    case 'weeksOfYear':
    case 'monthsOfYear':
      return new Calendar(unitsToArray(units), normMeasure)
  }
}

function unitsToArray (units: UnitsInput): (string | number)[] {

  if (!units) {
    throw new Error('Units not defined for recurrence rule.')
  } else if (Array.isArray(units)) {
    return units
  } else if (typeof units === 'object') {
    return Object.keys(units)
  } else if (typeof units === 'number' || typeof units === 'string') {
    return [units]
  } else {
    throw new Error('Provide an array, object, string or number when passing units!')
  }
}

// Private function to pluralize measure names for use with dictionaries.
export function pluralize (measure: MeasureInput): MeasurePlural {
  switch (measure) {
    case undefined:
    case null:
      throw new Error('Measure for recurrence rule undefined')

    case 'day':
      return 'days'

    case 'week':
      return 'weeks'

    case 'month':
      return 'months'

    case 'year':
      return 'years'

    case 'dayOfWeek':
      return 'daysOfWeek'

    case 'dayOfMonth':
      return 'daysOfMonth'

    case 'weekOfMonth':
      return 'weeksOfMonth'

    case 'weekOfMonthByDay':
      return 'weeksOfMonthByDay'

    case 'weekOfYear':
      return 'weeksOfYear'

    case 'monthOfYear':
      return 'monthsOfYear'

    default:
      return measure
  }
}

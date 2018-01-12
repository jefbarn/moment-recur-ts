import * as moment from 'moment'
import { Calendar } from './calendar'
import { Interval } from './interval'

export namespace Rule {
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

  /**
   * @internal
   * @hidden
   */
  export const MeasureSingleToPlural: {
    [m: string]: MeasurePlural
  } = {
    day: 'days',
    week: 'weeks',
    month: 'months',
    year: 'years',
    dayOfWeek: 'daysOfWeek',
    dayOfMonth: 'daysOfMonth',
    weekOfMonth: 'weeksOfMonth',
    weekOfMonthByDay: 'weeksOfMonthByDay',
    weekOfYear: 'weeksOfYear',
    monthOfYear: 'monthsOfYear'
  }

  export type UnitsInput = string | number | (string | number)[] | UnitsObject | undefined | null

  /**
   * @hidden
   * @deprecated
   */
  export interface UnitsObject {
    [unit: string]: boolean

    [unit: number]: boolean
  }

  export type MeasureInput = MeasureSingle | MeasurePlural | undefined | null

  /**
   * @internal
   * @hidden
   */
  export function factory (units: UnitsInput, measure: MeasureInput, start: moment.Moment | null): Rule {

    const normMeasure = normalizeMeasure(measure)

    switch (normMeasure) {
      case 'days':
      case 'weeks':
      case 'months':
      case 'years':
        return new Interval(unitsToArray(units), normMeasure, start)

      case 'daysOfWeek':
      case 'daysOfMonth':
      case 'weeksOfMonth':
      case 'weeksOfMonthByDay':
      case 'weeksOfYear':
      case 'monthsOfYear':
        return new Calendar(unitsToArray(units), normMeasure)
    }
  }

  /**
   * @internal
   * @hidden
   */
  function unitsToArray (units: UnitsInput): (string | number)[] {

    if (units == null) {
      throw new Error('Units not defined for recurrence rule.')
    } else if (Array.isArray(units)) {
      return units
    } else if (typeof units === 'object') {
      return Object.keys(units)
    } else if (typeof units === 'number') {
      return [units]
      // tslint:disable-next-line:strict-type-predicates
    } else if (typeof units === 'string') {
      return [units]
    } else {
      throw new Error('Provide an array, object, string or number when passing units!')
    }
  }

  /**
   * Private function to pluralize measure names for use with dictionaries.
   * @internal
   * @hidden
   */
  export function normalizeMeasure (measure: any): MeasurePlural {
    if (typeof measure === 'string') {
      if (MeasureSingleToPlural[measure]) {
        return MeasureSingleToPlural[measure]
      } else {
        for (const key in MeasureSingleToPlural) {
          if (MeasureSingleToPlural[key] === measure) return measure
        }
      }
    }
    throw new Error('Invalid Measure for recurrence: ' + measure)
  }
}

/**
 *
 */
export interface Rule {

  readonly units: number[]
  readonly measure: Rule.MeasurePlural

  /**
   * @internal
   * @hidden
   */
  match (date: moment.Moment): boolean

  next (current: moment.Moment, limit?: moment.Moment): moment.Moment

  previous (current: moment.Moment, limit?: moment.Moment): moment.Moment
}

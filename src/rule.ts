import { Moment } from 'moment'
import { Calendar } from './calendar'
import { Interval } from './interval'

export namespace Rule {

  /**
   * @internal
   * @hidden
   */
  export class MeasureSingleToPlural {
    public day: 'days'
    public week: 'weeks'
    public month: 'months'
    public year: 'years'
    public dayOfWeek: 'daysOfWeek'
    public dayOfMonth: 'daysOfMonth'
    public weekOfMonth: 'weeksOfMonth'
    public weekOfMonthByDay: 'weeksOfMonthByDay'
    public weekOfYear: 'weeksOfYear'
    public monthOfYear: 'monthsOfYear'
    [k: string]: string
  }
  export const Measures = new MeasureSingleToPlural()

  export type MeasureSingle = keyof MeasureSingleToPlural
  export type MeasurePlural = MeasureSingleToPlural[keyof MeasureSingleToPlural]

  export type UnitsInput = string | number | (string | number)[] | UnitsObject | undefined | null

  /**
   * @hidden
   * @deprecated
   */
  export interface UnitsObject {
    [unit: string]: boolean

    [unit: number]: boolean
  }

  export type MeasureInput = MeasureSingle | MeasurePlural | undefined

  /**
   * @internal
   * @hidden
   */
  export function factory (units: UnitsInput, measure: MeasureInput, start: Moment | null): Rule {

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

      default:
        throw new Error('Invalid measure in recurrence rule')
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
    for (const singleMeasure of Object.keys(Measures)) {
      const pluralMeasure = Measures[singleMeasure]
      if (measure === singleMeasure || measure === pluralMeasure) return pluralMeasure
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
  match (date: Moment): boolean

  next (current: Moment, limit?: Moment): Moment

  previous (current: Moment, limit?: Moment): Moment
}

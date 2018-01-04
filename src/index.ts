import * as moment from 'moment'
import { Recur } from './recur'
// Polyfills
/** @internal */
import 'core-js/fn/object/values'
/** @internal */
import 'core-js/fn/number/is-integer'
/** @internal */
import 'core-js/fn/array/includes'
/** @internal */
import 'core-js/fn/array/find-index'

declare module 'moment' {

  export interface Moment {

    /**
     * The `monthWeek()` method can be used to determine the week of the month a date is in.
     * ```js
     * moment("01/01/2014").monthWeek(); // 0
     * ```
     */
    monthWeek (): number

    /**
     * Plugin for calculating the occurrence of the day of the week in the month.
     * Similar to `moment().monthWeek()`, the return value is zero-indexed.
     * A return value of 2 means the date is the 3rd occurence of that day
     * of the week in the month.
     */
    monthWeekByDay (): number

    /**
     * The `dateOnly()` method can be used to remove any time information from a moment.
     * ```js
     * moment("2014-01-01 09:30:26").dateOnly(); // 01/01/2014 12:00:00 AM
     * ```
     */
    dateOnly (): moment.Moment

    /**
     * Recur can also be created the following ways:
     * ```js
     * moment().recur()
     * moment().recur(options)
     * moment().recur(start, end)
     * moment(start).recur(end)
     * moment().recur(end)
     * ```
     */
    recur (start?: moment.MomentInput, end?: moment.MomentInput): Recur
    recur (options?: Recur.Options): Recur

    /**
     * @internal
     * @hidden
     */
    set (unit: moment.unitOfTime.All, value: number | string): moment.Moment
  }

  /**
   * Recur can be created the following ways:
   * ```js
   * moment.recur()
   * moment.recur(options)
   * moment.recur(start)
   * moment.recur(start, end)
   * ```
   */
  export function recur (start?: moment.MomentInput, end?: moment.MomentInput): Recur
  export function recur (options?: Recur.Options): Recur
}

moment.fn.monthWeek = function monthWeek (): number {
  // First day of the first week of the month
  let week0 = this.clone().startOf('month').startOf('week')

  // First day of week
  let day0 = this.clone().startOf('week')

  return day0.diff(week0, 'weeks')
}

moment.fn.monthWeekByDay = function monthWeekByDay (): number {
  return Math.floor((this.date() - 1) / 7)
}

// Plugin for removing all time information from a given date
moment.fn.dateOnly = function dateOnly (): moment.Moment {
  // return this.startOf('day')
  return this.isValid() ? moment.utc(this.format('YYYY-MM-DD')) : this
}

;(moment as any).recur = function (start?: moment.MomentInput | Recur.Options, end?: moment.MomentInput) {
  // If we have an object, use it as a set of options
  if (typeof start === 'object' && !moment.isMoment(start)) {
    let options = start as Recur.Options
    return new Recur(options)
  }

  // else, use the values passed
  return new Recur({ start: start, end: end })
}

moment.fn.recur = function (start?: moment.MomentInput | Recur.Options, end?: moment.MomentInput): Recur {
  // If we have an object, use it as a set of options
  if (start === Object(start) && !moment.isMoment(start)) {
    let options = start as Recur.Options
    // if we have no start date, use the moment
    if (options.start === undefined) {
      options.start = this
    }

    return new Recur(options)
  }

  // if there is no end value, use the start value as the end
  if (!end) {
    end = start as moment.MomentInput
    start = undefined
  }

  // use the moment for the start value
  if (!start) {
    start = this
  }

  return new Recur({ start: start as moment.MomentInput, end: end })
}

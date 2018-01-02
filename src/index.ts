import * as moment from 'moment'
import { Recur, RecurOptions } from './recur'

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

    monthWeek (): number

    monthWeekByDay (): number

    dateOnly (): moment.Moment

    recur (start?: moment.MomentInput, end?: moment.MomentInput): Recur

    recur (options?: RecurOptions): Recur

    /**
     * @internal
     * @hidden
     */
    set (unit: moment.unitOfTime.All, value: number | string): moment.Moment
  }

  export function recur (start?: moment.MomentInput, end?: moment.MomentInput): Recur
  export function recur (options?: RecurOptions): Recur

  // /**
  //  * @internal
  //  * @hidden
  //  */
  // namespace HTML5_FMT {
  //   export const DATE: string
  // }
}

// Plugin for calculating the week of the month of a date
moment.fn.monthWeek = function monthWeek () {
  // First day of the first week of the month
  let week0 = this.clone().startOf('month').startOf('week')

  // First day of week
  let day0 = this.clone().startOf('week')

  return day0.diff(week0, 'weeks')
}

// Plugin for calculating the occurrence of the day of the week in the month.
// Similar to `moment().monthWeek()`, the return value is zero-indexed.
// A return value of 2 means the date is the 3rd occurence of that day
// of the week in the month.
moment.fn.monthWeekByDay = function monthWeekByDay () {
  return Math.floor((this.date() - 1) / 7)
}

// Plugin for removing all time information from a given date
moment.fn.dateOnly = function dateOnly () {
  // return this.startOf('day')
  return this.isValid() ? moment.utc(this.format('YYYY-MM-DD')) : this
}

// Recur can be created the following ways:
// moment.recur()
// moment.recur(options)
// moment.recur(start)
// moment.recur(start, end)
;(moment as any).recur = function (start?: moment.MomentInput | RecurOptions, end?: moment.MomentInput) {
  // If we have an object, use it as a set of options
  if (typeof start === 'object' && !moment.isMoment(start)) {
    let options = start as RecurOptions
    return new Recur(options)
  }

  // else, use the values passed
  return new Recur({ start: start, end: end })
}

// Recur can also be created the following ways:
// moment().recur()
// moment().recur(options)
// moment().recur(start, end)
// moment(start).recur(end)
// moment().recur(end)
moment.fn.recur = function (start?: moment.MomentInput | RecurOptions, end?: moment.MomentInput): Recur {
  // If we have an object, use it as a set of options
  if (start === Object(start) && !moment.isMoment(start)) {
    let options = start as RecurOptions
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

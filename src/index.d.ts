import * as moment from 'moment'
import { Recur, RecurOptions } from './recur'

export * from './recur'
export * from './rule'

declare module 'moment' {
  interface Moment {

    monthWeek (): number

    monthWeekByDay (): number

    dateOnly (): moment.Moment

    recur (start?: moment.MomentInput, end?: moment.MomentInput): Recur

    recur (options?: RecurOptions): Recur

    /** @internal */
    set (unit: moment.unitOfTime.All, value: number | string): moment.Moment
  }

  export function recur (start?: moment.MomentInput, end?: moment.MomentInput): Recur
  export function recur (options?: RecurOptions): Recur

  /** @internal */
  namespace HTML5_FMT {
    export const DATE: string
  }
}

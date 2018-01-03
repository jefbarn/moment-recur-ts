import * as moment from 'moment'
import { Interval } from './interval'
import {
  MeasureInput, MeasurePlural, MeasureSingleToPlural, pluralize, Rule, ruleFactory,
  UnitsInput
} from './rule'
import { expect } from "chai"

/** @hidden */
export type Moment = moment.Moment
/** @hidden */
export type MomentInput = moment.MomentInput

/**
 * Set options upon creation.
 *
 * > Note that the units for rules are converted to objects,
 * > so it is not recommended to set rules this way.
 * > They can be set in the options so that they can be imported.
 *
 * ```js
 * moment().recur({
 *   start: "01/01/2014",
 *   end: "12/31/2014",
 *   rules: [
 *     { units: [2], measure: "days" }
 *   ],
 *   exceptions: ["01/05/2014"]
 * });
 * ```
 */
export interface RecurOptions {
  start?: MomentInput
  end?: MomentInput
  rules?: {
    units: UnitsInput
    measure: MeasureInput
  }[]
  exceptions?: MomentInput[]
}

/**
 * @internal
 * @hidden
 */
const ISO_DATE_FMT = 'YYYY-MM-DD'

/**
 * @internal
 * @hidden
 */
type OccuranceType = 'next' | 'previous' | 'all'

/**
 * The main Recur object to provide an interface for settings, rules, and matching
 *
 * Creating Rules
 * --------------
 * moment-recur-ts uses rules to define when a date should recur. You can then generate future
 * or past recurrences based on these rules, or see if a specific date matches the rules.
 * Rules can also be overridden or removed.
 *
 * ### Length Intervals
 * moment-recur-ts supports intervals for days, weeks, months, and years. Measurements may be singular or
 * plural (ex: `day()` vs `days()`). Length Intervals **must** have a start date defined.
 *
 * Possible Length Intervals Include:
 * * day / days
 * * week / weeks
 * * month / months
 * * year / years
 *
 * ### Calendar Intervals
 * Calendar Intervals do not depend on a start date. They define a unit of another unit. For instance,
 * a day of a month, or a month of a year. Measurements may be singular or plural
 * (ex: `dayOfMonth()` vs `daysOfMonth()`).
 *
 * Possible Calendar Intervals Include:
 * * dayOfWeek / daysOfWeek
 * * dayOfMonth / daysOfMonth
 * * weekOfMonth / weeksOfMonth
 * * weekOfYear / weeksOfYear
 * * monthOfYear / monthsOfYear
 */
export class Recur implements Iterable<moment.Moment> {

  /** @internal */
  protected start: Moment | null
  /** @internal */
  protected end: Moment | null
  /** @internal */
  protected from: Moment | null

  /** @internal */
  private rules: Rule[]
  /** @internal */
  private exceptions: Moment[]

  /** @internal */
  private units: UnitsInput
  /** @internal */
  private measure: MeasureInput

  /** @internal */
  private reversed = false

  /**
   * ### Recur Object Constrcutor
   *
   * From an instance of moment:
   * ```js
   * let recurrence;
   *
   * // Create a recurrence using today as the start date.
   * recurrence = moment().recur();
   *
   * // Create a recurrence while passing the start and end dates to the recur function.
   * // Note: passing an end date requires you to also pass a start date.
   * recurrence = moment().recur( start, end );
   *
   * // You may pass a start date to the moment, or use an existing moment, to set the start date.
   * // In this case, passing a date to the recur function sets and end date.
   * recurrence = moment(start).recur( end );
   *
   * // Finally, you can create a recurrence and pass in an entire set of options.
   * recurrence = moment().recur({
   *   start: "01/01/2014",
   *   end: "01/01/2015"
   * });
   * ```
   * From static moment:
   * ```js
   * // Create recurrence without a start date. Note: this will not work with intervals.
   * recurrence = moment.recur();
   *
   * // Create a recurrence, passing just the start, or the start and end dates.
   * recurrence = moment.recur( start, end );
   *
   * // Create a recurrence, passing set of options.
   * recurrence = moment.recur({
   *   start: "01/01/2014",
   *   end: "01/01/2015"
   * });
   * ```
   */
  constructor (options: RecurOptions) {
    if (options.start) {
      this.start = moment(options.start).dateOnly()
    }

    if (options.end) {
      this.end = moment(options.end).dateOnly()
    }

    // Our list of rules, all of which must match
    this.rules = (options.rules || []).map(rule => ruleFactory(rule.units, rule.measure))

    // Our list of exceptions. Match always fails on these dates.
    let exceptions = options.exceptions || []
    this.exceptions = exceptions.map(ex => moment(ex).dateOnly())

    // Temporary units integer, array, or object. Does not get imported/exported.
    this.units = null

    // Temporary measure type. Does not get imported/exported.
    this.measure = null

    // Temporary from date for next/previous. Does not get imported/exported.
    this.from = null

    return this
  }

  /**
   * Get/Set the Start Date
   * ```js
   * recurrence.startDate(); // Get
   * recurrence.startDate("01/01/2014"); // Set
   * ```
   * @category getter/setter
   */
  startDate (): Moment
  startDate (date: MomentInput | null): Recur
  startDate (date?: MomentInput): Moment | Recur {
    if (date === null) {
      this.start = null
      return this
    }

    if (date) {
      this.start = moment(date).dateOnly()
      return this
    }

    if (!this.start) {
      throw new Error('No start date defined for recurrence.')
    }
    return this.start
  }

  /**
   * Get/Set the End Date
   * ```js
   * recurrence.endDate(); // Get
   * recurrence.endDate("01/01/2014"); // Set
   * ```
   * @category getter/setter
   */
  endDate (): Moment
  endDate (date: MomentInput | null): Recur
  endDate (date?: MomentInput): Moment | Recur {
    if (date === null) {
      this.end = null
      return this
    }

    if (date) {
      this.end = moment(date).dateOnly()
      return this
    }

    if (!this.end) {
      throw new Error('No end date defined for recurrence.')
    }
    return this.end
  }

  /**
   * Get/Set a temporary "From Date" for use with generating dates
   * ```js
   * recurrence.fromDate(); // Get
   * recurrence.fromDate("01/01/2014"); // Set
   * ```
   * @category getter/setter
   */
  fromDate (): Moment
  fromDate (date: MomentInput | null): Recur
  fromDate (date?: MomentInput): Moment | Recur {
    if (date === null) {
      this.from = null
      return this
    }

    if (date) {
      this.from = moment(date).dateOnly()
      return this
    }

    if (!this.from) {
      throw new Error('No from date defined for recurrence.')
    }
    return this.from
  }

  /**
   * Use `save()` to export all options, rules, and exceptions as an object.
   * This can be used to store recurrences in a database.
   * > Note: This does not export the "From Date" which is considered a temporary option.
   * ```js
   * recurrence.save();
   * ```
   */
  save (): RecurOptions {
    let data: RecurOptions = {}

    if (this.start && moment(this.start).isValid()) {
      data.start = this.start.format(ISO_DATE_FMT)
    }

    if (this.end && moment(this.end).isValid()) {
      data.end = this.end.format(ISO_DATE_FMT)
    }

    data.exceptions = this.exceptions.map(date => date.format(ISO_DATE_FMT))

    data.rules = this.rules

    return data
  }

  /**
   * Use `repeats()` to check if a recurrence has rules set.
   * ```js
   * recurrence.repeats(); // true/false
   * ```
   */
  repeats (): boolean {
    return this.rules.length > 0
  }

  /**
   * The `every()` function allows you to set the units and, optionally, the measurment type
   * of the recurring date. It returns the recur object to allow chaining.
   *
   *  ```js
   *  let myDate, recurrence;
   *
   *  // Create a date to start from
   *  myDate = moment("01/01/2014");
   *
   *  // You can pass the units to recur on, and the measurement type.
   *  recurrence = myDate.recur().every(1, "days");
   *
   *  // You can also chain the measurement type instead of passing it to every.
   *  recurrence = myDate.recur().every(1).day();
   *
   *  // It is also possible to pass an array of units.
   *  recurrence = myDate.recur().every([3, 5]).days();
   *
   *  // When using the dayOfWeek measurement, you can pass days names.
   *  recurrence = myDate.recur().every(["Monday", "wed"]).daysOfWeek();
   *
   *  // Month names also work when using monthOfYear.
   *  recurrence = myDate.recur().every(["Jan", "february"], "monthsOfYear");
   *  ```
   *
   *  `every()` will override the last "every" if a measurement was not provided.
   *  The following line will create a recurrence for every 5 days.
   *  ```js
   *  recurrence  = myDate.recur().every(1).every(5).days();
   *  ```
   *  If you need to specify multiple units, pass an array to `every()`.
   *
   *  You may also pass the units directly to the interval functions (listed below)
   *  instead of using `every()`.
   *  ```js
   *  let recurrence = moment.recur().monthOfYear("January");
   *  ```
   */
  every (units: UnitsInput, measure?: MeasureInput): this {

    if (units != null) {
      this.units = units
    }

    if (measure != null) {
      this.measure = measure
    }

    // Don't create the rule until measure is defined
    if (!this.measure) {
      return this
    }

    let rule = ruleFactory(this.units, this.measure)

    if (rule instanceof Interval) {
      if (!this.start) {
        throw new Error('Must have a start date set to set an interval!')
      }
    }

    if (rule.measure === 'weeksOfMonthByDay' && !this.hasRule('daysOfWeek')) {
      throw new Error('weeksOfMonthByDay must be combined with daysOfWeek')
    }

    // Remove the temporary rule data
    this.units = null
    this.measure = null

    // Remove existing rule based on measure
    this.rules = this.rules.filter(oldRule => oldRule.measure !== rule.measure)

    this.rules.push(rule)
    return this
  }

  /**
   * To prevent a date from matching that would normally match, use the `except()` function.
   * ```js
   * let recurrence = moment("01/01/2014").recur().every(1).day().except("01/02/2014");
   * recurrence.matches("01/02/2014"); // false
   * ```
   */
  except (date: MomentInput) {
    date = moment(date).dateOnly()
    this.exceptions.push(date)
    return this
  }

  /**
   * Forgets rules (by passing measure) and exceptions (by passing date)
   * ```js
   * // Exceptions can be removed by passing a date to the forget() function.
   * recurrence.forget("01/03/2014");
   * ```
   * ```js
   * // Rules can be removed by passing the measurement to the forget() function.
   * recurrence.forget("days");
   * ```
   */
  forget (dateOrRule: MomentInput | MeasureInput, format?: string): this {

    if (!dateOrRule) {
      throw new Error('Invalid input for recurrence forget: ' + dateOrRule)
    }

    if (typeof dateOrRule === 'string' && (
        Object.values(MeasureSingleToPlural).includes(dateOrRule as MeasurePlural) ||
        MeasureSingleToPlural.hasOwnProperty(dateOrRule)
      )) {
      this.rules = this.rules.filter(rule => rule.measure !== pluralize(dateOrRule as MeasureInput))
      return this
    } else {
      let date = moment(dateOrRule, format)

      // If valid date, try to remove it from exceptions
      if (date.isValid()) {
        date = date.dateOnly() // change to date only for perfect comparison
        this.exceptions = this.exceptions.filter(exception => !date.isSame(exception))
        return this
      } else {
        throw new Error('Invalid input for recurrence forget: ' + dateOrRule)
      }
    }
  }

  /**
   * Checks if a rule has been set on the chain
   */
  hasRule (measure: MeasureInput) {
    return this.rules.findIndex(rule => rule.measure === pluralize(measure)) !== -1
  }

  /**
   * The `matches()` function will test a date to check if all of the recurrence rules match.
   * It returns `true` if the date matches, `false` otherwise.
   * ```js
   * let interval = moment("01/01/2014").recur().every(2).days();
   * interval.matches("01/02/2014"); // false
   * interval.matches("01/03/2014"); // true
   * ```
   *
   * You may also see if a date matches before the start date or after the end date by
   * passing `true` as the second argument to `matches()`.
   * ```js
   * let interval = moment("01/01/2014").recur().every(2).days();
   * interval.matches("12/30/2013"); // false
   * interval.matches("12/30/2013", true); // true
   * ```
   */
  matches (dateToMatch: MomentInput, ignoreStartEnd?: boolean): boolean {
    let date = moment(dateToMatch).dateOnly()

    if (!date.isValid()) {
      throw Error('Invalid date supplied to match method: ' + dateToMatch)
    }

    if (!ignoreStartEnd && !this.inRange(date)) {
      return false
    }

    if (this.isException(date)) {
      return false
    }

    if (!this.matchAllRules(date)) {
      return false
    }

    // if we passed everything above, then this date matches
    return true
  }

  /**
   * Iterate over moments matched by rules
   * > Note if there is no end date, results are unbounded (you must manually terminate the iterator).
   *
   * > Also note, this exapmle intentionally ignores some complicated leap year math.
   *
   * ```js
   * let recurrence = moment('2012-01').recur('2032-01').every(4).years()
   * let leapYears = [...recurrence].map(m => m.year())
   * // leapYears = [ 2012, 2016, 2020, 2024, 2028, 2032 ]
   * ```
   * Or, this is a bit faster...
   * ```js
   * let recurrence = moment('2012-01').recur('2032-01').every(4).years()
   * let leapYears = []
   * for (let date of recurrence) {
   *   leapYears.push(date.year())
   * }
   * // leapYears = [ 2012, 2016, 2020, 2024, 2028, 2032 ]
   * ```
   */
  *[Symbol.iterator] () {

    let startFrom = this.from || this.start
    if (!startFrom) {
      throw Error('Cannot get occurrences without start or from date.')
    }

    if (this.end && (startFrom > this.end)) {
      throw Error('Start date cannot be later than end date.')
    }

    let currentDate = startFrom.clone()

    while (this.end ? currentDate.isSameOrBefore(this.end) : true) {

      if (this.matches(currentDate, true)) {
        yield currentDate.clone()
      }
      if (this.reversed) {
        currentDate.subtract(1, 'day')
      } else {
        currentDate.add(1, 'day')
      }
    }
  }

  /**
   * Reverse iterator direction
   * > Note since there is no end date, results are unbounded (you must manually terminate the iterator).
   *
   * ```js
   * let mondays = []
   * for (let momday of moment().recur().every('Monday').dayOfWeek().reverse()) {
   *   lastThreeMondays.push(monday)
   *   if (mondays.length > 10) break
   * }
   * ```
   */
  reverse (): this {
    this.reversed = !this.reversed
    return this
  }

  /**
   * With both a start date and an end date set, you can generate all dates within
   * that range that match the pattern (including the start/end dates).
   *
   * ```js
   * let recurrence = moment().recur("01/01/2014", "01/07/2014").every(2).days();
   *
   * // Outputs: ["01/01/2014", "01/03/2014", "01/05/2014", "01/07/2014"]
   * allDates = recurrence.all("L");
   * ```
   */
  all (): Moment[]
  all (format: string): string[]
  all (format?: string): (string | Moment)[] {

    if (!this.end) {
      throw Error('Cannot get all occurrences without an end date.')
    }

    this.reversed = false

    if (format) {
      let dates: string[] = []
      for (let date of this) {
        dates.push(date.format(format))
      }
      return dates
    } else {
      return [...this]
    }
  }

  /**
   * Get next N occurrences
   * ```js
   * // Generate the next three dates as moments
   * // Outputs: [moment("01/03/2014"), moment("01/05/2014"), moment("01/07/2014")]
   * nextDates = recurrence.next(3);
   * ```
   * ```js
   * // Generate the next three dates, formatted in local format
   * // Outputs: ["01/03/2014", "01/05/2014", "01/07/2014"]
   * nextDates = recurrence.next(3, "L");
   * ```
   */
  next (num: number): Moment[]
  next (num: number, format: string): string[]
  next (num: number, format?: string): (string | Moment)[] {
    if (!num) return []
    let dates: (string | Moment)[] = []
    let count = 0
    this.reversed = false
    for (let date of this) {
      if (!(this.start && date.isSame(this.start))) {
        dates.push(format ? date.format(format) : date)
        count++
      }
      if (count >= num) break
    }
    return dates
  }

  /**
   * Get previous N occurrences
   * ```js
   * // Generate previous three dates, formatted in local format
   * // Outputs: ["12/30/2013", "12/28/2013", "12/26/2013"]
   * nextDates = recurrence.previous(3, "L");
   * ```
   */
  previous (num: number): Moment[]
  previous (num: number, format: string): string[]
  previous (num?: number, format?: string): (string | Moment)[] {
    if (!num) return []
    let dates: (string | Moment)[] = []
    let count = 0
    this.reversed = true
    for (let date of this) {
      if (!(this.start && date.isSame(this.start))) {
        dates.push(format ? date.format(format) : date)
        count++
      }
      if (count >= num) break
    }
    return dates
  }

  day (units?: UnitsInput): this {
    this.every(units, 'days')
    return this
  }

  days (units?: UnitsInput): this {
    this.every(units, 'days')
    return this
  }

  week (units?: UnitsInput): this {
    this.every(units, 'weeks')
    return this
  }

  weeks (units?: UnitsInput): this {
    this.every(units, 'weeks')
    return this
  }

  month (units?: UnitsInput): this {
    this.every(units, 'months')
    return this
  }

  months (units?: UnitsInput): this {
    this.every(units, 'months')
    return this
  }

  year (units?: UnitsInput): this {
    this.every(units, 'years')
    return this
  }

  years (units?: UnitsInput): this {
    this.every(units, 'years')
    return this
  }

  dayOfWeek (units?: UnitsInput): this {
    this.every(units, 'daysOfWeek')
    return this
  }

  daysOfWeek (units?: UnitsInput): this {
    this.every(units, 'daysOfWeek')
    return this
  }

  dayOfMonth (units?: UnitsInput): this {
    this.every(units, 'daysOfMonth')
    return this
  }

  daysOfMonth (units?: UnitsInput): this {
    this.every(units, 'daysOfMonth')
    return this
  }

  weekOfMonth (units?: UnitsInput): this {
    this.every(units, 'weeksOfMonth')
    return this
  }

  weeksOfMonth (units?: UnitsInput): this {
    this.every(units, 'weeksOfMonth')
    return this
  }

  weekOfYear (units?: UnitsInput): this {
    this.every(units, 'weeksOfYear')
    return this
  }

  weeksOfYear (units?: UnitsInput): this {
    this.every(units, 'weeksOfYear')
    return this
  }

  /**
   * ```js
   * // Will match any date that is in January of any year.
   * cal = moment.recur().every("January").monthsOfYear();
   * ```
   */
  monthOfYear (units?: UnitsInput): this {
    this.every(units, 'monthsOfYear')
    return this
  }
  monthsOfYear (units?: UnitsInput): this {
    this.every(units, 'monthsOfYear')
    return this
  }

  /**
   * A weekOfMonthByDay interval is available for combining with the daysOfWeek to
   * achieve "nth weekday of month" recurrences. The following matches every 1st
   * and 3rd Thursday of the month.
   * > (Note this cannot be combined at the moment with every(x).months() expression)
   *
   * ```js
   * cal = moment.recur()
   *   .every("Thursday").daysOfWeek()
   *   .every([0, 2]).weeksOfMonthByDay();
   * ```
   * ```js
   * cal = moment.recur()
   *   .every(moment("01/01/2014").day()).daysOfWeek()
   *   .every(moment("01/01/2014").monthWeekByDay()).weeksOfMonthByDay();
   * ```
   */
  weeksOfMonthByDay (units?: UnitsInput): this {
    this.every(units, 'weeksOfMonthByDay')
    return this
  }

  /**
   * Private function to see if a date is within range of start/end
   * @internal
   */
  private inRange (date: Moment) {
    if (this.start && date.isBefore(this.start)) {
      return false
    } else if (this.end && date.isAfter(this.end)) {
      return false
    } else {
      return true
    }
  }

  /**
   * Private function to check if a date is an exception
   * @internal
   */
  private isException (date: MomentInput): boolean {

    for (let exception of this.exceptions) {
      if (moment(exception).isSame(date)) {
        return true
      }
    }
    return false
  }

  /**
   * Private funtion to see if all rules match
   * @internal
   */
  private matchAllRules (date: Moment) {

    for (let rule of this.rules) {
      if (!rule.match(date, this.start || undefined)) {
        return false
      }
    }

    return true
  }

}

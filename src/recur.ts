import * as moment from 'moment'
import { Interval } from './interval'
import {
  MeasureInput, MeasurePlural, MeasureSingleToPlural, pluralize, Rule, ruleFactory,
  UnitsInput
} from './rule'

export type Moment = moment.Moment
export type MomentInput = moment.MomentInput

export interface RecurOptions {
  start?: MomentInput
  end?: MomentInput
  rules?: {
    units: UnitsInput
    measure: MeasureInput
  }[]
  exceptions?: MomentInput[]
}

type OccuranceType = 'next' | 'previous' | 'all'

// The main Recur object to provide an interface for settings, rules, and matching
export class Recur {

  protected start: Moment | null
  protected end: Moment | null
  protected from: Moment | null

  private rules: Rule[]
  private exceptions: Moment[]

  private units: UnitsInput
  private measure: MeasureInput

  // Recur Object Constrcutor
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

  // Get/Set start date
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

  // Get/Set end date
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

  // Get/Set a temporary from date
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

  // Export the settings, rules, and exceptions of this recurring date
  save (): RecurOptions {
    let data: RecurOptions = {}

    if (this.start && moment(this.start).isValid()) {
      data.start = this.start.format(moment.HTML5_FMT.DATE)
    }

    if (this.end && moment(this.end).isValid()) {
      data.end = this.end.format(moment.HTML5_FMT.DATE)
    }

    data.exceptions = this.exceptions.map(date => date.format(moment.HTML5_FMT.DATE))

    data.rules = this.rules

    return data
  }

  // Return boolean value based on whether this date repeats (has rules or not)
  repeats (): boolean {
    return this.rules.length > 0
  }

  // Set the units and, optionally, the measure
  every (units?: UnitsInput, measure?: MeasureInput) {

    if (units != null) {
      this.units = units
    }

    if (measure != null) {
      this.measure = measure
    }

    return this.trigger()
  }

  // Creates an exception date to prevent matches, even if rules match
  except (date: MomentInput) {
    date = moment(date).dateOnly()
    this.exceptions.push(date)
    return this
  }

  // Forgets rules (by passing measure) and exceptions (by passing date)
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

  // Checks if a rule has been set on the chain
  hasRule (measure: MeasureInput) {
    return this.rules.findIndex(rule => rule.measure === pluralize(measure)) !== -1
  }

  // Attempts to match a date to the rules
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

  // Get next N occurrences
  next (num: number): Moment[]
  next (num: number, format: string): string[]
  next (num: number, format?: string): (string | Moment)[] {
    return this.getOccurrences('next', num, format)
  }

  // Get previous N occurrences
  previous (num: number): Moment[]
  previous (num: number, format: string): string[]
  previous (num: number, format?: string): (string | Moment)[] {
    return this.getOccurrences('previous', num, format)
  }

  // Get all occurrences between start and end date
  all (): Moment[]
  all (format: string): string[]
  all (format?: string): (string | Moment)[] {
    return this.getOccurrences('all', null, format)
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

  monthOfYear (units?: UnitsInput): this {
    this.every(units, 'monthsOfYear')
    return this
  }

  monthsOfYear (units?: UnitsInput): this {
    this.every(units, 'monthsOfYear')
    return this
  }

  weeksOfMonthByDay (units?: UnitsInput): this {
    this.every(units, 'weeksOfMonthByDay')
    return this
  }

  // Private method that tries to set a rule.
  private trigger () {

    if (!(this instanceof Recur)) {
      throw Error('Private method trigger() was called directly or not called as instance of Recur!')
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

  // Private method to get next, previous or all occurrences
  private getOccurrences (type: OccuranceType, num: number | null, format?: string): (string | Moment)[] {
    let currentDate

    let dates: (string | Moment)[] = []

    if (!(this instanceof Recur)) {
      throw Error('Private method getOccurrences() was called directly or not called as instance of Recur!')
    }

    let startFrom = this.from || this.start
    if (!startFrom) {
      throw Error('Cannot get occurrences without start or from date.')
    }

    if (type === 'all' && !this.end) {
      throw Error('Cannot get all occurrences without an end date.')
    }

    if (this.end && (startFrom > this.end)) {
      throw Error('Start date cannot be later than end date.')
    }

    // Return empty set if the caller doesn't want any for next/prev
    if (type !== 'all' && !num) {
      return []
    }

    // Start from the from date, or the start date if from is not set.
    currentDate = startFrom.clone()

    // Include the initial date in the results if wanting all dates
    if (type === 'all') {
      if (this.matches(currentDate, false)) {
        if (format) {
          dates.push(currentDate.format(format))
        } else {
          dates.push(currentDate.clone())
        }
      }
    }

    // Get the next N dates, if num is null then infinite
    while (dates.length < (num === null ? dates.length + 1 : num)) {
      if (type === 'next' || type === 'all') {
        currentDate.add(1, 'day')
      } else {
        currentDate.subtract(1, 'day')
      }

      // Don't match outside the date if generating all dates within start/end
      if (this.matches(currentDate, (type !== 'all'))) {
        if (format) {
          dates.push(currentDate.format(format))
        } else {
          dates.push(currentDate.clone())
        }
      }
      if (this.end && currentDate >= this.end) {
        break
      }
    }

    return dates
  }

  // Private function to see if a date is within range of start/end
  private inRange (date: Moment) {
    if (this.start && date.isBefore(this.start)) {
      return false
    } else if (this.end && date.isAfter(this.end)) {
      return false
    } else {
      return true
    }
  }

  // Private function to check if a date is an exception
  private isException (date: MomentInput): boolean {

    for (let exception of this.exceptions) {
      if (moment(exception).isSame(date)) {
        return true
      }
    }
    return false
  }

  // Private funtion to see if all rules match
  private matchAllRules (date: Moment) {

    for (let rule of this.rules) {
      if (!rule.match(date, this.start || undefined)) {
        return false
      }
    }

    return true
  }

}

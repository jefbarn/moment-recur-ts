import 'core-js'
import moment from 'moment-timezone'
import '../src'
import { Recur } from '../src/recur'
import * as Ix from '@reactivex/ix-es2015-cjs'

const ISO_DATE_FMT = 'YYYY-MM-DD'

let startDate = '2013-01-01'
let endDate = '2014-01-01'

describe('Creating a recurring moment', async function () {

  let nowMoment = moment()
  let nowDate = nowMoment.format(ISO_DATE_FMT)

  it('from moment constructor, with options parameter - moment.recur(options)', function () {
    let recur = moment.recur({ start: startDate, end: endDate })
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })

  it('from moment constructor, with start parameter only - moment.recur(start)', function () {
    let recur = moment.recur(startDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
  })

  it('from moment constructor, with start and end parameters - moment.recur(start, end)', function () {
    let recur = moment.recur(startDate, endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })

  it('from moment function, with options parameter - moment().recur(options)', function () {
    let recur = moment().recur({ start: startDate, end: endDate })
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })

  it('from moment function, with start and end parameters - moment().recur(start, end)', function () {
    let recur = moment().recur(startDate, endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })

  it('from moment function, with starting moment and end parameter - moment(start).recur(end)', function () {
    let recur = moment(startDate).recur(endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })

  it('from moment function, starting now, with end parameter  - moment().recur(end)', function () {
    let recur = nowMoment.recur(endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(nowDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })

  it('from moment function, starting now - moment().recur()', function () {
    let recur = nowMoment.recur()
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(nowDate)
  })

  it('from moment function, with starting moment and end parameter, which is a moment object - moment(start).recur(end)', function () {
    let startMoment = moment(startDate)
    let endMoment = moment(endDate)
    let recur = moment(startMoment).recur(endMoment)
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })

  it('from moment function, with options parameter without start date', function () {
    let recur = moment(startDate).recur({ end: endDate })
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
  })
})

describe('Setting', function () {
  let recur: Recur

  beforeEach(function () {
    recur = moment().recur()
  })

  it('\'start\' should be getable/setable with startDate()', function () {
    let recurrence = recur.startDate(startDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).toBe(startDate)
    recurrence.startDate(null)
    expect(() => {
      recurrence.startDate()
    }).toThrowError('No start date defined for recurrence')
  })

  it('\'end\' should be getable/setable with endDate()', function () {
    let recurrence = recur.endDate(endDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).toBe(endDate)
    recurrence.endDate(null)
    expect(() => {
      recurrence.endDate()
    }).toThrowError('No end date defined for recurrence')
  })

  it('\'from\' should be getable/setable with fromDate()', function () {
    let recurrence = recur.fromDate(startDate)
    expect(recur.fromDate().format(ISO_DATE_FMT)).toBe(startDate)
    recurrence.fromDate(null)
    expect(() => {
      recurrence.fromDate()
    }).toThrowError('No from date defined for recurrence')
  })
})

describe('The every() function', function () {
  it('should create a rule when a unit and measurement is passed', function () {
    let recurrence = moment().recur().every(1, 'day')
    expect(recurrence.save().rules).toHaveLength(1)
  })

  it('should not create a rule when only a unit is passed', function () {
    let recurrence = moment().recur().every(1)
    expect(recurrence.save().rules).toHaveLength(0)
  })

  it('should set the temporary units property', function () {
    let recurrence = moment().recur().every(1)
    expect(recurrence['units']).not.toBeNull()
  })

  it('should accept an array', function () {
    let recurrence = moment().recur().every([1, 2])
    expect(recurrence['units']).not.toBeNull()
  })

  it('should not accept invalid input', function () {
    expect(() => {
      moment().recur().every('toothpaste').days()
    }).toThrowError('Intervals must be integers')
    expect(() => {
      moment().recur().every(undefined).day()
    }).toThrowError('Units not defined for recurrence rule')
    expect(() => {
      moment().recur().every(true as any).day()
    }).toThrowError('Provide an array, object, string or number when passing units')
  })
})

describe('An interval', function () {
  it('should not match a date before the start date', function () {
    let start = moment(startDate)
    let before = start.clone().subtract(1, 'day')
    let recurrence = start.recur()
    recurrence.every(1, 'day')
    expect(recurrence.matches(before)).toBe(false)
  })

  it('should not match a date after the end date', function () {
    let start = moment(startDate)
    let after = moment(endDate).add(1, 'day')
    let recurrence = start.recur()
    recurrence.endDate(endDate).every(1, 'day')
    expect(recurrence.matches(after)).toBe(false)
  })

  it('can be daily', function () {
    let recurrence = moment(startDate).recur().every(2).days()
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(3, 'days'))).toBe(false)
    let days = recurrence.next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2013-01-03',
      '2013-01-05',
      '2013-01-07',
      '2013-01-09'
    ])
  })

  it('can be weekly', function () {
    let recurrence = moment(startDate).recur().every(2).weeks()
    expect(recurrence.matches(moment(startDate).add(2, 'weeks'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).toBe(false)
    expect(recurrence.matches(moment(startDate).add(3, 'weeks'))).toBe(false)
    let days = recurrence.next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2013-01-15',
      '2013-01-29',
      '2013-02-12',
      '2013-02-26'
    ])
    recurrence = moment(startDate).recur().every(1).week()
    expect(recurrence.matches(moment(startDate).add(7, 'days'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).toBe(false)
  })

  it('can be monthly', function () {
    let recurrence = moment(startDate).recur().every(3).months()
    expect(recurrence.matches(moment(startDate).add(3, 'months'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(2, 'months'))).toBe(false)
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).toBe(false)
    let days = recurrence.next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2013-04-01',
      '2013-07-01',
      '2013-10-01',
      '2014-01-01'
    ])
    recurrence = moment(startDate).recur().every(1).month()
    expect(recurrence.matches(moment(startDate).add(3, 'month'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).toBe(false)
  })

  it('can be yearly', function () {
    let recurrence = moment(startDate).recur().every(2).years()
    expect(recurrence.matches(moment(startDate).add(2, 'year'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(3, 'year'))).toBe(false)
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).toBe(false)
    let days = recurrence.next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2015-01-01',
      '2017-01-01',
      '2019-01-01',
      '2021-01-01'
    ])
    recurrence = moment(startDate).recur().every(1).year()
    expect(recurrence.matches(moment(startDate).add(3, 'year'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).toBe(false)
  })

  it('can be an array of intervals', function () {
    let recurrence = moment(startDate).recur().every([3, 5]).days()
    expect(recurrence.matches(moment(startDate).add(3, 'days'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(5, 'days'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(10, 'days'))).toBe(true)
    expect(recurrence.matches(moment(startDate).add(4, 'days'))).toBe(false)
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).toBe(false)
    let days = recurrence.next(5, ISO_DATE_FMT)
    expect(days).toEqual([
      '2013-01-04',
      '2013-01-06',
      '2013-01-07',
      '2013-01-10',
      '2013-01-11'
    ])
  })

  it('must have start date', function () {
    expect(() => {
      moment.recur().every(5).days()
    }).toThrowError('Must have a start date set to set an interval')
  })

  it('must be valid', function () {
    expect(() => {
      moment(startDate).recur().every(-1).days()
    }).toThrowError('Intervals must be greater than zero')
    expect(() => {
      let recurrence = moment(startDate).recur().every([3, 5]).days()
      recurrence.matches(moment.invalid())
    }).toThrowError('Invalid date supplied to match method')
  })
})

describe('The Calendar Interval', function () {

  describe('daysOfWeek', function () {
    it('should work', function () {
      let recurrence = moment.recur().every(['Sunday', 1]).daysOfWeek()
      expect(recurrence.matches(moment().day('Sunday'))).toBe(true)
      expect(recurrence.matches(moment().day(1))).toBe(true)
      expect(recurrence.matches(moment().day(3))).toBe(false)
      recurrence = moment.recur().every('Thursday').dayOfWeek()
      expect(recurrence.matches(moment().day('Thursday'))).toBe(true)
      let days = recurrence.fromDate('2018-01-01').next(4, ISO_DATE_FMT)
      expect(days).toEqual([
        '2018-01-04',
        '2018-01-11',
        '2018-01-18',
        '2018-01-25'
      ])
    })

    it('should work with timezones', function () {
      let recurrence = moment.tz('2015-01-25', 'America/Vancouver').recur().every(['Sunday', 1]).daysOfWeek()
      let check = moment.tz('2015-02-01', 'Asia/Hong_Kong')
      expect(recurrence.matches(check)).toBe(true)
      let days = recurrence.next(4, ISO_DATE_FMT)
      expect(days).toEqual([
        '2015-01-26',
        '2015-02-01',
        '2015-02-02',
        '2015-02-08'
      ])
    })
  })

  it('daysOfMonth should work', function () {
    let recurrence = moment('2015-01-01').recur().every([1, 10]).daysOfMonth()
    expect(recurrence.matches(moment('2015-01-01'))).toBe(true)
    expect(recurrence.matches(moment('2015-01-02'))).toBe(false)
    expect(recurrence.matches(moment('2015-01-10'))).toBe(true)
    expect(recurrence.matches(moment('2015-01-15'))).toBe(false)
    expect(recurrence.matches(moment('2015-02-01'))).toBe(true)
    expect(recurrence.matches(moment('2015-02-02'))).toBe(false)
    expect(recurrence.matches(moment('2015-02-10'))).toBe(true)
    expect(recurrence.matches(moment('2015-02-15'))).toBe(false)
    let days = recurrence.next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2015-01-10',
      '2015-02-01',
      '2015-02-10',
      '2015-03-01'
    ])
    recurrence = moment('2015-01-01').recur().every(15).dayOfMonth()
    expect(recurrence.matches(moment('2015-01-15'))).toBe(true)
  })

  it('weeksOfMonth matches should work', function () {
    let recurrence = moment.recur().every([1, 3]).weeksOfMonth()
    expect(recurrence.matches(moment(startDate).date(6))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(26))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(27))).toBe(false)
    recurrence = moment.recur().every([0, 2]).weeksOfMonth()
    let days = recurrence.fromDate('2018-02-01').next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2018-02-01',
      '2018-02-02',
      '2018-02-03',
      '2018-02-11'
    ])
    recurrence = moment.recur().every(4).weekOfMonth()
    expect(recurrence.matches(moment(startDate).date(27))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(26))).toBe(false)
  })

  it('weeksOfMonth interval should work', function () {
    let recurrence = moment('2018-01').recur('2018-02').every(1).weeksOfMonth()
    expect(recurrence.all(ISO_DATE_FMT)).toEqual([
      '2018-01-07', '2018-01-08', '2018-01-09', '2018-01-10', '2018-01-11', '2018-01-12', '2018-01-13'
    ])
  })

  it('weeksOfYear should work', function () {
    let recurrence = moment.recur().every(20).weekOfYear()
    expect(recurrence.matches(moment('2014-05-14'))).toBe(true)
    expect(recurrence.matches(moment(startDate))).toBe(false)
    let days = recurrence.fromDate('2018-01-01').next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2018-05-13',
      '2018-05-14',
      '2018-05-15',
      '2018-05-16'
    ])
    recurrence = moment.recur().every(1).weeksOfYear()
    expect(recurrence.matches(moment('2018-01-01'))).toBe(true)
    expect(recurrence.matches(moment('2018-02-01'))).toBe(false)
  })

  it('weeksOfYear interval should work', function () {
    let recurrence = moment('2017-12-01').recur('2018-02-28').weekOfYear(1)
    expect(recurrence.all(ISO_DATE_FMT)).toEqual([
      '2017-12-31',
      '2018-01-01',
      '2018-01-02',
      '2018-01-03',
      '2018-01-04',
      '2018-01-05',
      '2018-01-06'
    ])
  })

  it('monthsOfYear should work', function () {
    let recurrence = moment.recur().every('January').monthsOfYear()
    expect(recurrence.matches(moment().month('January'))).toBe(true)
    expect(recurrence.matches(moment().month('February'))).toBe(false)
    recurrence = moment.recur().every(11).monthOfYear()
    expect(recurrence.matches(moment().month('Dec'))).toBe(true)
    expect(recurrence.matches(moment().month('Nov'))).toBe(false)
    let days = recurrence.fromDate('2018-01-01').next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2018-12-01',
      '2018-12-02',
      '2018-12-03',
      '2018-12-04'
    ])
  })

  it('monthsOfYear interval should work', function () {
    let recurrence = moment.recur('2018-01', '2019-01').every('April').monthsOfYear()
    expect(recurrence.all(ISO_DATE_FMT)).toEqual(moment.recur('2018-04-01', '2018-04-30').every(1, 'day').all(ISO_DATE_FMT))
  })

  it('should detect invalid range', function () {
    expect(() => {
      moment.recur().every(13).monthsOfYear()
    }).toThrowError('Value should be in range')
    expect(() => {
      moment.recur().every('Tuesday').weeksOfYear()
    }).toThrowError('Invalid calendar unit in recurrence')
  })

  it('rules can be combined', function () {
    let valentines = moment.recur()
      .every(14).daysOfMonth()
      .every('February').monthsOfYear()
      .except('2021-02-14')
    expect(valentines.matches(moment('2014-02-14'))).toBe(true)
    expect(valentines.matches(moment(startDate))).toBe(false)
    let days = valentines.fromDate('2018-01-01').next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2018-02-14',
      '2019-02-14',
      '2020-02-14',
      '2022-02-14'
    ])
  })

  it('can be passed units, without every()', function () {
    let recurrence = moment.recur().daysOfMonth([1, 3])
    expect(recurrence.matches('2014-01-01')).toBe(true)
    expect(recurrence.matches('2014-01-03')).toBe(true)
    expect(recurrence.matches('2014-01-06')).toBe(false)
    let days = recurrence.fromDate('2018-01-01').next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2018-01-01',
      '2018-01-03',
      '2018-02-01',
      '2018-02-03'
    ])
  })

  it('should match end of month', function () {
    let recurrence = moment('2018-02-01').recur().daysOfMonth(-1)
    expect(recurrence.matches('2018-02-28')).toBe(true)
    expect(recurrence.matches('2018-03-31')).toBe(true)
    expect(recurrence.matches('2018-04-30')).toBe(true)
    expect(recurrence.matches('2018-05-30')).toBe(false)
    let days = moment('2018-02-01').recur().every('last').dayOfMonth().next(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2018-02-28',
      '2018-03-31',
      '2018-04-30',
      '2018-05-31'
    ])
  })
})

describe('Rules', function () {
  it('should be overridden when duplicated', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    recurrence.every(2).days()
    expect(recurrence['rules']).toHaveLength(1)
  })

  it('should be forgettable', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    recurrence.forget('days')
    expect(recurrence['rules']).toHaveLength(0)
  })

  it('forget should check valid input', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    expect(() => {
      recurrence.forget('toothpaste', ISO_DATE_FMT)
    }).toThrowError('Invalid input for recurrence forget')
    expect(() => {
      recurrence.forget(null)
    }).toThrowError('Invalid input for recurrence forget')
  })

  it('should be possible to see if one exists', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    expect(recurrence.hasRule('days')).toBe(true)
    expect(recurrence.hasRule('months')).toBe(false)
  })
})

describe('weeksOfMonthByDay()', function () {
  it('can recur on the 1st and 3rd Sundays of the month', function () {
    let recurrence
    recurrence = moment.recur()
      .every(['Sunday']).daysOfWeek()
      .every([0, 2]).weeksOfMonthByDay()
    expect(recurrence.matches(moment(startDate))).toBe(false)
    expect(recurrence.matches(moment(startDate).date(6))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(8))).toBe(false)
    expect(recurrence.matches(moment(startDate).date(13))).toBe(false)
    expect(recurrence.matches(moment(startDate).date(20))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(27))).toBe(false)
  })

  it('can recur on the 2nd, 4th and 5th Sundays and Thursdays of the month', function () {
    let recurrence
    recurrence = moment.recur()
      .every(['Sunday', 'Thursday']).daysOfWeek()
      .every([1, 3, 4]).weeksOfMonthByDay()
    expect(recurrence.matches(moment(startDate).date(6))).toBe(false)
    expect(recurrence.matches(moment(startDate).date(13))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(20))).toBe(false)
    expect(recurrence.matches(moment(startDate).date(27))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(3))).toBe(false)
    expect(recurrence.matches(moment(startDate).date(10))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(17))).toBe(false)
    expect(recurrence.matches(moment(startDate).date(24))).toBe(true)
    expect(recurrence.matches(moment(startDate).date(31))).toBe(true)
  })

  it('can recur on the 4th Wednesday of the month', function () {
    let recurrence
    recurrence = moment.recur()
      .every(moment('2017-09-27').day()).daysOfWeek()
      .every(moment('2017-09-27').monthWeekByDay()).weeksOfMonthByDay()

    expect(recurrence.matches(moment('2017-09-27'))).toBe(true)
    expect(recurrence.matches(moment('2017-10-25'))).toBe(true)
    expect(recurrence.matches(moment('2017-11-22'))).toBe(true)
    expect(recurrence.matches(moment('2017-12-27'))).toBe(true)

  })

  it('will throw an error if used without daysOfWeek()', function () {
    let caught = { message: false }
    try {
      moment.recur().every(0).weeksOfMonthByDay()
    } catch (e) {
      caught = e
    }
    expect(caught.message).toBe('weeksOfMonthByDay must be combined with daysOfWeek')
  })

  it('works with all() function', function () {
    let recurrence
    recurrence = moment('2018-01-01').recur('2018-01-31')
      .every(['Sunday']).daysOfWeek()
      .every([0, 2]).weeksOfMonthByDay()
    expect(recurrence.all(ISO_DATE_FMT)).toEqual(['2018-01-07', '2018-01-21'])
  })

  it('works with previous() function', function () {
    let recurrence
    recurrence = moment('2018-01-01').recur()
      .every(['Sunday']).daysOfWeek()
      .every([0, 2]).weeksOfMonthByDay()
    expect(recurrence.previous(2, ISO_DATE_FMT)).toEqual(['2017-12-17', '2017-12-03'])
  })
})

describe('Future Dates', function () {
  it('can be generated', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = recurrence.next(3, ISO_DATE_FMT)
    expect(nextDates).toEqual(['2014-01-03', '2014-01-05', '2014-01-07'])
  })

  it('can start from a temporary \'from\' date', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    recurrence.fromDate('2014-02-05')
    let nextDates = recurrence.next(3, ISO_DATE_FMT)
    expect(nextDates).toHaveLength(3)
    expect(nextDates[0]).toBe('2014-02-06')
    expect(nextDates[1]).toBe('2014-02-08')
    expect(nextDates[2]).toBe('2014-02-10')
  })

  it('must have start/from dates', function () {
    expect(() => {
      let recurrence = moment.recur().every('monday').dayOfWeek()
      recurrence.next(3, ISO_DATE_FMT)
    }).toThrowError('Cannot get occurrences without start or from date')
  })

  it('must have valid start/from dates', function () {
    expect(() => {
      let recurrence = moment.recur('2017-02-31').every('monday').dayOfWeek()
      recurrence.next(3, ISO_DATE_FMT)
    }).toThrowError('Cannot get occurrences without start or from date')
    expect(() => {
      let recurrence = moment.recur().every('monday').dayOfWeek().fromDate('2017-02-31')
      recurrence.next(3, ISO_DATE_FMT)
    }).toThrowError('Cannot get occurrences without start or from date')
  })

  it('should return moments', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = recurrence.next(3)
    expect(nextDates).toHaveLength(3)
    expect(nextDates[2].format()).toBe(moment.utc('2014-01-07').format())
  })

  it('should give empty set', function () {
    let recurrence = moment().recur().every('monday').dayOfWeek()
    expect(recurrence.next(undefined as any)).toHaveLength(0)
  })

  it('should be iterable', function () {
    let recurrence = moment('2018-01').recur('2018-02').every('Monday').dayOfWeek()
    let mondays = [...recurrence].map(m => m.format(ISO_DATE_FMT))
    expect(mondays).toEqual([
      '2018-01-01',
      '2018-01-08',
      '2018-01-15',
      '2018-01-22',
      '2018-01-29'
    ])
  })

  it('should describe election day', function () {
    // The Tuesday after the first Monday of November
    let recurrence = moment('2017-01').recur()
      .every('Monday').dayOfWeek()
      .every(0).weeksOfMonthByDay()
      .every('Nov').monthsOfYear()
    let elections = recurrence.next(4)
      .map(m => m.add(1, 'day').format(ISO_DATE_FMT))
    expect(elections).toEqual([
      '2017-11-07',
      '2018-11-06',
      '2019-11-05',
      '2020-11-03'
    ])
  })

  it('should describe valentines day', function () {
    let recurrence = moment('2018-01').recur()
      .every(14).daysOfMonth()
      .every('Februray').monthsOfYear()
    let valentines = recurrence.next(4, ISO_DATE_FMT)
    expect(valentines).toEqual([
      '2018-02-14',
      '2019-02-14',
      '2020-02-14',
      '2021-02-14'
    ])
  })

  it('should find leap years', function () {
    let recurrence = moment('2018-01-01').recur()
      .every('Feb').monthsOfYear()
      .every(29).daysOfMonth()
    let dates = recurrence.next(5, ISO_DATE_FMT)
    expect(dates).toEqual([
      '2020-02-29',
      '2024-02-29',
      '2028-02-29',
      '2032-02-29',
      '2036-02-29'
    ])
  })

  it('should give empty set for rules that never match', async function () {
    let recurrence = moment('2018-01-01').recur()
      .every('Feb').monthsOfYear()
      .every(30).daysOfMonth()
      .maxYears(100)
    let dates = recurrence.next(5, ISO_DATE_FMT)
    expect(dates).toEqual([])

    dates = recurrence.previous(5, ISO_DATE_FMT)
    expect(dates).toEqual([])

    expect(recurrence.maxYears()).toBe(100)
  })

  it('should allow elaborate calendar rules', function () {
    let recurrence = moment('2017-12-31').recur()
      .every('Sat').dayOfWeek()
      .every([2]).daysOfMonth()
      .every(0).weeksOfMonth()
      .every(48).weeksOfYear()
      .every(11).monthsOfYear()
    let dates = recurrence.next(4, ISO_DATE_FMT)
    expect(dates).toEqual([
      '2023-12-02',
      '2034-12-02',
      '2045-12-02',
      '2051-12-02'
    ])
  })
})

describe('Previous Dates', function () {

  it('should be iterable', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = Ix.Iterable.from(recurrence.reverse())
      .take(4)
      .map(d => d.format(ISO_DATE_FMT))
      .toArray()
    expect(nextDates).toEqual([
      '2014-01-01',
      '2013-12-30',
      '2013-12-28',
      '2013-12-26'
    ])
    // expect(nextDates[3].format()).to.equal(moment.utc('2013-12-26').format())
  })

  it('can be generated', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = recurrence.previous(3, ISO_DATE_FMT)
    expect(nextDates).toHaveLength(3)
    expect(nextDates[0]).toBe('2013-12-30')
    expect(nextDates[1]).toBe('2013-12-28')
    expect(nextDates[2]).toBe('2013-12-26')
  })

  it('should return moments', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = recurrence.previous(3)
    expect(nextDates).toHaveLength(3)
    expect(nextDates[0].format()).toBe(moment.utc('2013-12-30').format())
  })

  it('should give empty set', function () {
    let recurrence = moment().recur().every('monday').dayOfWeek()
    expect(recurrence.previous(undefined as any)).toHaveLength(0)
  })

  it('can use calendar format', function () {
    let recurrence = moment('2018-01').recur().every('Monday').dayOfWeek()
    let mondays = recurrence.previous(4, ISO_DATE_FMT)
    expect(mondays).toEqual([
      '2017-12-25',
      '2017-12-18',
      '2017-12-11',
      '2017-12-04'
    ])
  })

  it('should allow elaborate calendar rules', function () {
    let recurrence = moment('2017-12-31').recur()
      .every('Sat').dayOfWeek()
      .every(2).daysOfMonth()
      .every(0).weeksOfMonth()
      .every(48).weeksOfYear()
      .every(11).monthsOfYear()
    let dates = recurrence.previous(4, ISO_DATE_FMT)
    expect(dates).toEqual([
      '2017-12-02',
      '2006-12-02',
      '1995-12-02',
      '1989-12-02'
    ])
  })

  it('can use last day of week', function () {
    let recurrence = moment('2018-01').recur().every('last').dayOfWeek()
    let days = recurrence.previous(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2017-12-30',
      '2017-12-23',
      '2017-12-16',
      '2017-12-09'
    ])
  })

  it('can use last week of year', function () {
    let recurrence = moment('2018-01').recur()
      .every('last').weekOfYear()
      .dayOfWeek('tues')
    let days = recurrence.previous(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2017-01-03',
      '2016-12-27',
      '2015-12-29',
      '2014-12-30'
    ])
  })

  it('can find years with 53 weeks', function () {
    let recurrence = moment('2018-01').recur()
      .weekOfYear(53).dayOfMonth('last')
    let days = recurrence.previous(4, ISO_DATE_FMT)
    expect(days).toEqual([
      '2016-12-31',
      '2011-12-31',
      '2005-12-31',
      '1994-12-31'
    ])
  })
})

describe('All Dates', function () {
  it('can be generated', function () {
    let recurrence = moment('2014-01-01').recur('2014-01-07').every(2).days()
    let allDates = recurrence.all(ISO_DATE_FMT)
    expect(allDates).toHaveLength(4)
    expect(allDates[0]).toBe('2014-01-01')
    expect(allDates[1]).toBe('2014-01-03')
    expect(allDates[2]).toBe('2014-01-05')
    expect(allDates[3]).toBe('2014-01-07')
  })

  it('can start from a temporary \'from\' date', function () {
    let recurrence = moment().recur('2014-01-01', '2014-01-08').every(2).days()
    recurrence.fromDate('2014-01-05')
    let allDates = recurrence.all(ISO_DATE_FMT)
    expect(allDates).toHaveLength(2)
    expect(allDates[0]).toBe('2014-01-05')
    expect(allDates[1]).toBe('2014-01-07')
  })

  it('should throw error if start date is after end date', function () {
    let recurrence = moment().recur('2017-07-26', '2013-08-01').every(2).days()
    expect(function () {
      recurrence.all(ISO_DATE_FMT)
    }).toThrowError('Start date cannot be later than end date.')
  })

  it('should only generate a single date when start date and end date are the same', function () {
    let recurrence = moment().recur('2014-01-01', '2014-01-01').every(1).days()
    let allDates = recurrence.all(ISO_DATE_FMT)
    expect(allDates).toHaveLength(1)
    expect(allDates[0]).toBe('2014-01-01')
  })

  it('must have end date', function () {
    expect(() => {
      let recurrence = moment('2018-01-01').recur().every(1).week()
      recurrence.all(ISO_DATE_FMT)
    }).toThrowError('Cannot get all occurrences without an end date')
  })

  it('must have a valid end date', function () {
    expect(() => {
      let recurrence = moment('2018-02-01').recur('2018-02-31').every(1).week()
      recurrence.all(ISO_DATE_FMT)
    }).toThrowError('Cannot get all occurrences without an end date')
  })

  it('should return moments', function () {
    let recurrence = moment('2014-01-01').recur('2014-01-07').every(2).days()
    let allDates = recurrence.all()
    expect(allDates).toHaveLength(4)
    expect(allDates[0].format()).toBe(moment.utc('2014-01-01').format())
  })

  it('should be iterable', function () {
    let recurrence = moment('2014-01-01').recur('2014-01-07').every(2).days()
    let allDates = [...recurrence]
    expect(allDates).toHaveLength(4)
    expect(allDates[0].format()).toBe(moment.utc('2014-01-01').format())
  })
})

describe('Exceptions', function () {
  let mo: moment.Moment
  let exception: moment.Moment
  let recur: Recur
  let exceptionWithTz: moment.Moment

  beforeEach(function () {
    mo = moment(startDate)
    exception = mo.clone().add(3, 'day')
    recur = mo.clone().recur().every(1, 'days')
    exceptionWithTz = moment.tz(exception.format(ISO_DATE_FMT), 'Asia/Hong_Kong')
  })

  it('should prevent exception days from matching', function () {
    recur.except(exception)
    expect(recur.matches(exception)).toBe(false)
  })

  it('should work when the passed in exception is in a different time zone', function () {
    recur.except(exception)
    expect(recur.matches(exceptionWithTz)).toBe(false)
  })

  it('should be removeable', function () {
    recur.except(exception)
    recur.forget(exception)
    expect(recur.matches(exception)).toBe(true)
  })

  it('should be not allow undefined measures', function () {
    expect(() => {
      moment().recur({
        start: '2014-01-01',
        end: '2014-12-31',
        rules: [
          { units: [2], measure: undefined }
        ],
        exceptions: ['2014-01-05']
      })
    }).toThrowError('Invalid Measure for recurrence: undefined')
  })

  it('should should work with iterator', function () {
    let recurrence = moment('2018-01-01').recur('2018-01-07').every(2).days()
    let days = recurrence.except('2018-01-05').all(ISO_DATE_FMT)

    expect(days).toEqual([
      '2018-01-01',
      '2018-01-03',
      '2018-01-07'
    ])
  })
})

describe('Exceptions with weeks', function () {
  let mo: moment.Moment
  let exception: moment.Moment
  let recur: Recur
  let exceptionWithTz: moment.Moment

  beforeEach(function () {
    mo = moment(startDate)
    exception = mo.clone().add(7, 'day')
    recur = mo.clone().recur().every(1, 'weeks')
    exceptionWithTz = moment.tz(exception.format(ISO_DATE_FMT), 'Asia/Hong_Kong')
  })

  it('should not match on the exception day', function () {
    expect(recur.matches(exception)).toBe(true)
    recur.except(exception)
    expect(recur.matches(exception)).toBe(false)
  })

  // TODO: maybe some more timezone checks
  it('should not match on the exception day with timezone', function () {
    expect(recur.matches(exceptionWithTz)).toBe(true)
    recur.except(exception)
    expect(recur.matches(exceptionWithTz)).toBe(false)
  })
})

describe('Options', function () {
  it('should be importable', function () {
    let recurrence = moment().recur({
      start: '2014-01-01',
      end: '2014-12-31',
      rules: [
        { units: { 2: true }, measure: 'days' }
      ],
      exceptions: ['2014-01-05']
    })

    expect(recurrence.startDate().format(ISO_DATE_FMT)).toBe('2014-01-01')
    expect(recurrence.endDate().format(ISO_DATE_FMT)).toBe('2014-12-31')
    expect(recurrence['rules']).toHaveLength(1)
    expect(recurrence['exceptions']).toHaveLength(1)
    expect(recurrence.matches('2014-01-03')).toBe(true)
    expect(recurrence.matches('2014-01-05')).toBe(false)
  })

  it('shold be exportable', function () {
    let recurrence = moment('2014-01-01').recur('2014-12-31').every(2, 'days').except('2014-01-05')
    let data = recurrence.save()
    expect(data.start).toBe('2014-01-01')
    expect(data.end).toBe('2014-12-31')
    expect(data.exceptions).toHaveLength(1)
    expect(data.exceptions).toContain('2014-01-05')
    expect(data.rules).toHaveProperty('0.units.0', 2)
    expect(data.rules && data.rules[0].measure).toBe('days')
  })

  it('shold export without all options set', function () {
    let recurrence = moment.recur().every('Thursday').dayOfWeek()
    let data = recurrence.save()
    expect(data.start).toBeUndefined()
    expect(data.end).toBeUndefined()
    expect(data.exceptions).toHaveLength(0)
    expect(data.rules).toHaveProperty('0.units.0', 4)
    expect(data.rules && data.rules[0].measure).toBe('daysOfWeek')
  })
})

describe('The repeats() function', function () {
  it('should return true when there are rules set', function () {
    let recurrence = moment().recur().every(1).days()
    expect(recurrence.repeats()).toBe(true)
  })

  it('should return false when there are no rules set', function () {
    let recurrence = moment().recur()
    expect(recurrence.repeats()).toBe(false)
  })
})

describe('Performance', function () {
  // this.timeout(10000)
  it('should generate thousands of dates', function () {
    // 200ms
    let recurrence = moment('2010-01-01').recur('2018-12-01').every(1).days()
    let allDates = recurrence.all(ISO_DATE_FMT)
    console.log(`Generated ${allDates.length} dates`)
    expect(allDates[0]).toBe('2010-01-01')
    expect(allDates[allDates.length - 1]).toBe('2018-12-01')
  })

  it('should quickly get sparse dates', function () {
    // 10ms
    let recurrence = moment('2000-01-01').recur('2018-12-01').every(1).month()
    let allDates = recurrence.all(ISO_DATE_FMT)
    console.log(`Generated ${allDates.length} dates`)
    expect(allDates[0]).toBe('2000-01-01')
    expect(allDates[allDates.length - 1]).toBe('2018-12-01')
  })

  it('should get unbounded dates', function () {
    // 100ms
    let recurrence = moment('2000-01-01').recur().every(1).week()
    let dates = recurrence.next(5000, ISO_DATE_FMT)
    console.log(`Generated ${dates.length} dates`)
    expect(dates[0]).toBe('2000-01-08')
    expect(dates[dates.length - 1]).toBe(moment('2000-01-01').add(5000, 'weeks').format(ISO_DATE_FMT))
  })

  it('iterable should be fast', function () {
    // 1ms
    let recurrence = moment('2010-01').recur()
      .monthOfYear('Feb')
      .dayOfMonth(29)

    let leapYears = Ix.Iterable.from(recurrence)
      .take(6)
      .map(date => date.year())
      .toArray()
    expect(leapYears).toEqual([2012, 2016, 2020, 2024, 2028, 2032])
  })
})

import * as moment from 'moment-timezone'
import '../src'
import { expect } from 'chai'
import { Recur } from '../src/recur'

/* tslint:disable:no-unused-expression */

const ISO_DATE_FMT = moment.HTML5_FMT.DATE

let startDate = '2013-01-01'
let endDate = '2014-01-01'

describe('Creating a recurring moment', function () {

  let nowMoment = moment()
  let nowDate = nowMoment.format(ISO_DATE_FMT)

  it('from moment constructor, with options parameter - moment.recur(options)', function () {
    let recur = moment.recur({ start: startDate, end: endDate })
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })

  it('from moment constructor, with start parameter only - moment.recur(start)', function () {
    let recur = moment.recur(startDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
  })

  it('from moment constructor, with start and end parameters - moment.recur(start, end)', function () {
    let recur = moment.recur(startDate, endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })

  it('from moment function, with options parameter - moment().recur(options)', function () {
    let recur = moment().recur({ start: startDate, end: endDate })
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })

  it('from moment function, with start and end parameters - moment().recur(start, end)', function () {
    let recur = moment().recur(startDate, endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })

  it('from moment function, with starting moment and end parameter - moment(start).recur(end)', function () {
    let recur = moment(startDate).recur(endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })

  it('from moment function, starting now, with end parameter  - moment().recur(end)', function () {
    let recur = nowMoment.recur(endDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(nowDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })

  it('from moment function, starting now - moment().recur()', function () {
    let recur = nowMoment.recur()
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(nowDate)
  })

  it('from moment function, with starting moment and end parameter, which is a moment object - moment(start).recur(end)', function () {
    let startMoment = moment(startDate)
    let endMoment = moment(endDate)
    let recur = moment(startMoment).recur(endMoment)
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })

  it('from moment function, with options parameter without start date', function () {
    let recur = moment(startDate).recur({ end: endDate })
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
  })
})

describe('Setting', function () {
  let recur: Recur

  beforeEach(function () {
    recur = moment().recur()
  })

  it('\'start\' should be getable/setable with startDate()', function () {
    let recurrence = recur.startDate(startDate)
    expect(recur.startDate().format(ISO_DATE_FMT)).to.equal(startDate)
    recurrence.startDate(null)
    expect(() => {
      recurrence.startDate()
    }).to.throw('No start date defined for recurrence')
  })

  it('\'end\' should be getable/setable with endDate()', function () {
    let recurrence = recur.endDate(endDate)
    expect(recur.endDate().format(ISO_DATE_FMT)).to.equal(endDate)
    recurrence.endDate(null)
    expect(() => {
      recurrence.endDate()
    }).to.throw('No end date defined for recurrence')
  })

  it('\'from\' should be getable/setable with fromDate()', function () {
    let recurrence = recur.fromDate(startDate)
    expect(recur.fromDate().format(ISO_DATE_FMT)).to.equal(startDate)
    recurrence.fromDate(null)
    expect(() => {
      recurrence.fromDate()
    }).to.throw('No from date defined for recurrence')
  })
})

describe('The every() function', function () {
  it('should create a rule when a unit and measurement is passed', function () {
    let recurrence = moment().recur().every(1, 'day')
    expect(recurrence.save().rules).have.lengthOf(1)
  })

  it('should not create a rule when only a unit is passed', function () {
    let recurrence = moment().recur().every(1)
    expect(recurrence.save().rules).to.be.empty
  })

  it('should set the temporary units property', function () {
    let recurrence = moment().recur().every(1)
    expect(recurrence['units']).to.not.be.null
  })

  it('should accept an array', function () {
    let recurrence = moment().recur().every([1, 2])
    expect(recurrence['units']).to.not.be.null
  })

  it('should not accept invalid input', function () {
    expect(() => {
      moment().recur().every('toothpaste').days()
    }).to.throw('Intervals must be integers')
    expect(() => {
      moment().recur().every().day()
    }).to.throw('Units not defined for recurrence rule')
    expect(() => {
      moment().recur().every(true as any).day()
    }).to.throw('Provide an array, object, string or number when passing units')
  })
})

describe('An interval', function () {
  it('should not match a date before the start date', function () {
    let start = moment(startDate)
    let before = start.clone().subtract(1, 'day')
    let recurrence = start.recur()
    recurrence.every(1, 'day')
    expect(recurrence.matches(before)).to.be.false
  })

  it('should not match a date after the end date', function () {
    let start = moment(startDate)
    let after = moment(endDate).add(1, 'day')
    let recurrence = start.recur()
    recurrence.endDate(endDate).every(1, 'day')
    expect(recurrence.matches(after)).to.be.false
  })

  it('can be daily', function () {
    let recurrence = moment(startDate).recur().every(2).days()
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(3, 'days'))).to.be.false
  })

  it('can be weekly', function () {
    let recurrence = moment(startDate).recur().every(2).weeks()
    expect(recurrence.matches(moment(startDate).add(2, 'weeks'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).to.be.false
    expect(recurrence.matches(moment(startDate).add(3, 'weeks'))).to.be.false
    recurrence = moment(startDate).recur().every(1).week()
    expect(recurrence.matches(moment(startDate).add(7, 'days'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).to.be.false
  })

  it('can be monthly', function () {
    let recurrence = moment(startDate).recur().every(3).months()
    expect(recurrence.matches(moment(startDate).add(3, 'months'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(2, 'months'))).to.be.false
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).to.be.false
    recurrence = moment(startDate).recur().every(1).month()
    expect(recurrence.matches(moment(startDate).add(3, 'month'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).to.be.false
  })

  it('can be yearly', function () {
    let recurrence = moment(startDate).recur().every(2).years()
    expect(recurrence.matches(moment(startDate).add(2, 'year'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(3, 'year'))).to.be.false
    expect(recurrence.matches(moment(startDate).add(2, 'days'))).to.be.false
    recurrence = moment(startDate).recur().every(1).year()
    expect(recurrence.matches(moment(startDate).add(3, 'year'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).to.be.false
  })

  it('can be an array of intervals', function () {
    let recurrence = moment(startDate).recur().every([3, 5]).days()
    expect(recurrence.matches(moment(startDate).add(3, 'days'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(5, 'days'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(10, 'days'))).to.be.true
    expect(recurrence.matches(moment(startDate).add(4, 'days'))).to.be.false
    expect(recurrence.matches(moment(startDate).add(8, 'days'))).to.be.false
  })

  it('must have start date', function () {
    expect(() => {
      moment.recur().every(5).days()
    }).to.throw('Must have a start date set to set an interval')
  })

  it('must be valid', function () {
    expect(() => {
      moment(startDate).recur().every(-1).days()
    }).to.throw('Intervals must be greater than zero')
    expect(() => {
      let recurrence = moment(startDate).recur().every([3, 5]).days()
      recurrence.matches(moment.invalid())
    }).to.throw('Invalid date supplied to match method')
  })
})

describe('The Calendar Interval', function () {

  describe('daysOfWeek', function () {
    it('should work', function () {
      let recurrence = moment.recur().every(['Sunday', 1]).daysOfWeek()
      expect(recurrence.matches(moment().day('Sunday'))).to.be.true
      expect(recurrence.matches(moment().day(1))).to.be.true
      expect(recurrence.matches(moment().day(3))).to.be.false
      recurrence = moment.recur().every('Thursday').dayOfWeek()
      expect(recurrence.matches(moment().day('Thursday'))).to.be.true
    })

    it('should work with timezones', function () {
      let recurrence = moment.tz('2015-01-25', 'America/Vancouver').recur().every(['Sunday', 1]).daysOfWeek()
      let check = moment.tz('2015-02-01', 'Asia/Hong_Kong')
      expect(recurrence.matches(check)).to.be.true
    })
  })

  it('daysOfMonth should work', function () {
    let recurrence = moment('2015-01-01').recur().every([1, 10]).daysOfMonth()
    expect(recurrence.matches(moment('2015-01-01'))).to.be.true
    expect(recurrence.matches(moment('2015-01-02'))).to.be.false
    expect(recurrence.matches(moment('2015-01-10'))).to.be.true
    expect(recurrence.matches(moment('2015-01-15'))).to.be.false
    expect(recurrence.matches(moment('2015-02-01'))).to.be.true
    expect(recurrence.matches(moment('2015-02-02'))).to.be.false
    expect(recurrence.matches(moment('2015-02-10'))).to.be.true
    expect(recurrence.matches(moment('2015-02-15'))).to.be.false
    recurrence = moment('2015-01-01').recur().every(15).dayOfMonth()
    expect(recurrence.matches(moment('2015-01-15'))).to.be.true
  })

  it('weeksOfMonth should work', function () {
    let recurrence = moment.recur().every([1, 3]).weeksOfMonth()
    expect(recurrence.matches(moment(startDate).date(6))).to.be.true
    expect(recurrence.matches(moment(startDate).date(26))).to.be.true
    expect(recurrence.matches(moment(startDate).date(27))).to.be.false
    recurrence = moment.recur().every(4).weekOfMonth()
    expect(recurrence.matches(moment(startDate).date(27))).to.be.true
    expect(recurrence.matches(moment(startDate).date(26))).to.be.false
  })

  it('weeksOfYear should work', function () {
    let recurrence = moment.recur().every(20).weekOfYear()
    expect(recurrence.matches(moment('2014-05-14'))).to.be.true
    expect(recurrence.matches(moment(startDate))).to.be.false
    recurrence = moment.recur().every(1).weeksOfYear()
    expect(recurrence.matches(moment('2018-01-01'))).to.be.true
    expect(recurrence.matches(moment('2018-02-01'))).to.be.false
  })

  it('monthsOfYear should work', function () {
    let recurrence = moment.recur().every('January').monthsOfYear()
    expect(recurrence.matches(moment().month('January'))).to.be.true
    expect(recurrence.matches(moment().month('February'))).to.be.false
    recurrence = moment.recur().every(11).monthOfYear()
    expect(recurrence.matches(moment().month('Dec'))).to.be.true
    expect(recurrence.matches(moment().month('Nov'))).to.be.false
  })

  it('should detect invalid range', function () {
    expect(() => {
      moment.recur().every(13).monthsOfYear()
    }).to.throw('Value should be in range')
    expect(() => {
      moment.recur().every('Tuesday').weeksOfYear()
    }).to.throw('Invalid calendar unit in recurrence')
  })

  it('rules can be combined', function () {
    let valentines = moment.recur().every(14).daysOfMonth()
      .every('Februray').monthsOfYear()
    expect(valentines.matches(moment('2014-02-14'))).to.be.true
    expect(valentines.matches(moment(startDate))).to.be.false
  })

  it('can be passed units, without every()', function () {
    let recurrence = moment.recur().daysOfMonth([1, 3])
    expect(recurrence.matches('2014-01-01')).to.be.true
    expect(recurrence.matches('2014-01-03')).to.be.true
    expect(recurrence.matches('2014-01-06')).to.be.false
  })

  it('should match end of month', function () {
    let recurrence = moment('2018-02-01').recur().daysOfMonth(28)
    expect(recurrence.matches('2018-02-28')).to.be.true
    expect(recurrence.matches('2018-03-31')).to.be.true
    expect(recurrence.matches('2018-04-30')).to.be.true
    expect(recurrence.matches('2018-05-30')).to.be.false
  })
})

describe('Rules', function () {
  it('should be overridden when duplicated', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    recurrence.every(2).days()
    expect(recurrence['rules']).to.have.lengthOf(1)
  })

  it('should be forgettable', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    recurrence.forget('days')
    expect(recurrence['rules']).to.have.lengthOf(0)
  })

  it('forget should check valid input', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    expect(() => {
      recurrence.forget('toothpaste', ISO_DATE_FMT)
    }).to.throw('Invalid input for recurrence forget')
    expect(() => {
      recurrence.forget(null)
    }).to.throw('Invalid input for recurrence forget')
  })

  it('should be possible to see if one exists', function () {
    let recurrence = moment('2014-01-01').recur().every(1).day()
    expect(recurrence.hasRule('days')).to.be.true
    expect(recurrence.hasRule('months')).to.be.false
  })
})

describe('weeksOfMonthByDay()', function () {
  it('can recur on the 1st and 3rd Sundays of the month', function () {
    let recurrence
    recurrence = moment.recur()
      .every(['Sunday']).daysOfWeek()
      .every([0, 2]).weeksOfMonthByDay()
    expect(recurrence.matches(moment(startDate))).to.be.false
    expect(recurrence.matches(moment(startDate).date(6))).to.be.true
    expect(recurrence.matches(moment(startDate).date(8))).to.be.false
    expect(recurrence.matches(moment(startDate).date(13))).to.be.false
    expect(recurrence.matches(moment(startDate).date(20))).to.be.true
    expect(recurrence.matches(moment(startDate).date(27))).to.be.false
  })

  it('can recur on the 2nd, 4th and 5th Sundays and Thursdays of the month', function () {
    let recurrence
    recurrence = moment.recur()
      .every(['Sunday', 'Thursday']).daysOfWeek()
      .every([1, 3, 4]).weeksOfMonthByDay()
    expect(recurrence.matches(moment(startDate).date(6))).to.be.false
    expect(recurrence.matches(moment(startDate).date(13))).to.be.true
    expect(recurrence.matches(moment(startDate).date(20))).to.be.false
    expect(recurrence.matches(moment(startDate).date(27))).to.be.true
    expect(recurrence.matches(moment(startDate).date(3))).to.be.false
    expect(recurrence.matches(moment(startDate).date(10))).to.be.true
    expect(recurrence.matches(moment(startDate).date(17))).to.be.false
    expect(recurrence.matches(moment(startDate).date(24))).to.be.true
    expect(recurrence.matches(moment(startDate).date(31))).to.be.true
  })

  it('can recur on the 4th Wednesday of the month', function () {
    let recurrence
    recurrence = moment.recur()
      .every(moment('2017-09-27').day()).daysOfWeek()
      .every(moment('2017-09-27').monthWeekByDay()).weeksOfMonthByDay()

    expect(recurrence.matches(moment('2017-09-27'))).to.be.true
    expect(recurrence.matches(moment('2017-10-25'))).to.be.true
    expect(recurrence.matches(moment('2017-11-22'))).to.be.true
    expect(recurrence.matches(moment('2017-12-27'))).to.be.true

  })

  it('will throw an error if used without daysOfWeek()', function () {
    let caught = { message: false }
    try {
      moment.recur().every(0).weeksOfMonthByDay()
    } catch (e) {
      caught = e
    }
    expect(caught.message).to.equal('weeksOfMonthByDay must be combined with daysOfWeek')
  })
})

describe('Future Dates', function () {
  it('can be generated', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = recurrence.next(3, ISO_DATE_FMT)
    expect(nextDates).to.have.lengthOf(3)
    expect(nextDates[0]).to.equal('2014-01-03')
    expect(nextDates[1]).to.equal('2014-01-05')
    expect(nextDates[2]).to.equal('2014-01-07')
  })

  it('can start from a temporary \'from\' date', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    recurrence.fromDate('2014-02-05')
    let nextDates = recurrence.next(3, ISO_DATE_FMT)
    expect(nextDates).to.have.lengthOf(3)
    expect(nextDates[0]).to.equal('2014-02-06')
    expect(nextDates[1]).to.equal('2014-02-08')
    expect(nextDates[2]).to.equal('2014-02-10')
  })

  it('must have start/from dates', function () {
    expect(() => {
      let recurrence = moment.recur().every('monday').dayOfWeek()
      recurrence.next(3, ISO_DATE_FMT)
    }).to.throw('Cannot get occurrences without start or from date')
  })

  it('should give empty set', function () {
    let recurrence = moment().recur().every('monday').dayOfWeek()
    expect(recurrence.next(undefined as any)).to.have.lengthOf(0)
  })
})

describe('Previous Dates', function () {
  it('can be generated', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = recurrence.previous(3, ISO_DATE_FMT)
    expect(nextDates).to.have.lengthOf(3)
    expect(nextDates[0]).to.equal('2013-12-30')
    expect(nextDates[1]).to.equal('2013-12-28')
    expect(nextDates[2]).to.equal('2013-12-26')
  })

  it('should return moments', function () {
    let recurrence = moment('2014-01-01').recur().every(2).days()
    let nextDates = recurrence.previous(3)
    expect(nextDates).to.have.lengthOf(3)
    expect(nextDates[0].format()).to.equal(moment.utc('2013-12-30').format())
  })
})

describe('All Dates', function () {
  it('can be generated', function () {
    let recurrence = moment('2014-01-01').recur('2014-01-07').every(2).days()
    let allDates = recurrence.all(ISO_DATE_FMT)
    expect(allDates).to.have.lengthOf(4)
    expect(allDates[0]).to.equal('2014-01-01')
    expect(allDates[1]).to.equal('2014-01-03')
    expect(allDates[2]).to.equal('2014-01-05')
    expect(allDates[3]).to.equal('2014-01-07')
  })

  it('can start from a temporary \'from\' date', function () {
    let recurrence = moment().recur('2014-01-01', '2014-01-08').every(2).days()
    recurrence.fromDate('2014-01-05')
    let allDates = recurrence.all(ISO_DATE_FMT)
    expect(allDates).to.have.lengthOf(2)
    expect(allDates[0]).to.equal('2014-01-05')
    expect(allDates[1]).to.equal('2014-01-07')
  })

  it('should throw error if start date is after end date', function () {
    let recurrence = moment().recur('2017-07-26', '2013-08-01').every(2).days()
    expect(function () {
      recurrence.all(ISO_DATE_FMT)
    }).to.throw('Start date cannot be later than end date.')
  })

  it('should only generate a single date when start date and end date are the same', function () {
    let recurrence = moment().recur('2014-01-01', '2014-01-01').every(1).days()
    let allDates = recurrence.all(ISO_DATE_FMT)
    expect(allDates).to.have.lengthOf(1)
    expect(allDates[0]).to.equal('2014-01-01')
  })

  it('must have end date', function () {
    expect(() => {
      let recurrence = moment('2018-01-01').recur().every(1).week()
      recurrence.all(ISO_DATE_FMT)
    }).to.throw('Cannot get all occurrences without an end date')
  })

  it('should return moments', function () {
    let recurrence = moment('2014-01-01').recur('2014-01-07').every(2).days()
    let allDates = recurrence.all()
    expect(allDates).to.have.lengthOf(4)
    expect(allDates[0].format()).to.equal(moment.utc('2014-01-01').format())
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
    expect(recur.matches(exception)).to.be.false
  })

  it('should work when the passed in exception is in a different time zone', function () {
    recur.except(exception)
    expect(recur.matches(exceptionWithTz)).to.be.false
  })

  it('should be removeable', function () {
    recur.except(exception)
    recur.forget(exception)
    expect(recur.matches(exception)).to.be.true
  })

  it('should not call private methods', function () {
    expect(() => {
      Recur.prototype['trigger']()
    }).to.throw('Private method trigger() was called directly')
    expect(() => {
      Recur.prototype['getOccurrences']('all', null)
    }).to.throw('Private method getOccurrences() was called directly')
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
    expect(recur.matches(exception)).to.be.true
    recur.except(exception)
    expect(recur.matches(exception)).to.be.false
  })

  // TODO: maybe some more timezone checks
  it('should not match on the exception day with timezone', function () {
    expect(recur.matches(exceptionWithTz)).to.be.true
    recur.except(exception)
    expect(recur.matches(exceptionWithTz)).to.be.false
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

    expect(recurrence.startDate().format(ISO_DATE_FMT)).to.equal('2014-01-01')
    expect(recurrence.endDate().format(ISO_DATE_FMT)).to.equal('2014-12-31')
    expect(recurrence['rules']).to.have.lengthOf(1)
    expect(recurrence['exceptions']).to.have.lengthOf(1)
    expect(recurrence.matches('2014-01-03')).to.be.true
    expect(recurrence.matches('2014-01-05')).to.be.false
  })

  it('shold be exportable', function () {
    let recurrence = moment('2014-01-01').recur('2014-12-31').every(2, 'days').except('2014-01-05')
    let data = recurrence.save()
    expect(data.start).to.equal('2014-01-01')
    expect(data.end).to.equal('2014-12-31')
    expect(data.exceptions).to.have.lengthOf(1)
    expect(data.exceptions).to.include('2014-01-05')
    expect(data.rules).to.have.nested.property('[0].units[0]', 2)
    expect(data.rules && data.rules[0].measure).to.equal('days')
  })
})

describe('The repeats() function', function () {
  it('should return true when there are rules set', function () {
    let recurrence = moment().recur().every(1).days()
    expect(recurrence.repeats()).to.be.true
  })

  it('should return false when there are no rules set', function () {
    let recurrence = moment().recur()
    expect(recurrence.repeats()).to.be.false
  })
})

describe('Performance', function () {
  it('should generate thousands of dates', function () {
    // 312ms
    let recurrence = moment('2000-01-01').recur('2018-12-01').every(1).days()
    let allDates = recurrence.all(ISO_DATE_FMT)
    console.log(`Generated ${allDates.length} dates`)
    expect(allDates[0]).to.equal('2000-01-01')
    expect(allDates[allDates.length - 1]).to.equal('2018-12-01')
  })

  it('should quickly get sparse dates', function () {
    // 282ms
    let recurrence = moment('2000-01-01').recur('2018-12-01').every(1).month()
    let allDates = recurrence.all(ISO_DATE_FMT)
    console.log(`Generated ${allDates.length} dates`)
    expect(allDates[0]).to.equal('2000-01-01')
    expect(allDates[allDates.length - 1]).to.equal('2018-12-01')
  })

  it('should get unbounded dates', function () {
    // 812ms
    let recurrence = moment('2000-01-01').recur().every(1).week()
    let dates = recurrence.next(5000, ISO_DATE_FMT)
    console.log(`Generated ${dates.length} dates`)
    expect(dates[0]).to.equal('2000-01-08')
    expect(dates[dates.length - 1]).to.equal(
      moment('2000-01-01').add(5000, 'weeks').format(ISO_DATE_FMT)
    )
  })
})

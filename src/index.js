var _ = require('lodash').runInContext()
var moment = require('moment')
var util = require('util')
var packageJson = require(__dirname + '/../package.json')


// Configure Lodash:
_.mixin(_, {chain: true}); Object.defineProperty(_.prototype, 'v', {get: _.prototype.value})

var $$ = {}

$$.VERSION = packageJson.version

function morph(number, words) {
    var CHOICES = [2, 0, 1, 1, 1, 2]

    if (number % 100 > 4 && number % 100 < 20) {
        var choice = 2
    } else {
        var i = number % 10 < 5 ? number % 10 : 5
        var choice = CHOICES[i]
    }

    return words[choice]
}

$$.morph = morph


function format() {
    var str = _.head(arguments)
    var args = _.tail(arguments)

    while (true) {
        if (str.search('%s') === -1)
            break

        var arg = args.shift()
        str = str.replace('%s', arg == null ? '' : arg)
    }

    return str
}

$$.format = format


function remove(coll, item) {
    Array.prototype.splice.call(coll, _.indexOf(item, coll), 1)
    return coll
}

$$.remove = remove


function inspect() {
    console.log(util.inspect.apply(util, arguments))
}

$$.inspect = inspect


function randomDate() {
    return new Date(_.random(1990, 2016), _.random(11), _.random(1, 28))
}

$$.randomDate = randomDate


function randomIdent(arg1, str) {
    var size = typeof arg1 === 'number' ? arg1 : 8
    str = typeof str === 'string' && str.length > 0 ? str : null

    if (typeof arg1 === 'string' && arg1.length > 0)
        str = arg1

    var asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'
    var chars = format('%s%s%s', asciiLowercase, asciiLowercase.toUpperCase(), '0123456789')

    var ident

    if (size > 0)
        ident = _(asciiLowercase).sample().concat(_.sampleSize(chars, size - 1)).join('').v

    return str ? format(str, ident) : ident
}

$$.randomIdent = randomIdent


////function random2(min, max) {
//function random2(order) {
//    var MAX_SAFE_INT = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1
//    var MAX_ORDER = getOrder(MAX_SAFE_INT)
//
//    //if (min > max)
//    //    throw new Error('"Min" must be less than or equal to "max"')
//    //
//    //order = getOrder(max)
//
//    if (order < 0)
//        throw new Error('Not implemented')
//
//    if (order > MAX_ORDER) {
//        console.warn('Order too big, setting to ' + MAX_ORDER)
//        order = MAX_ORDER
//    }
//
//    var max_ = Math.pow(10, _.random(0, order) + 1) - 1 // TODO: "max_" can't be more than "max"
//
//    //return _.random(min, max_)
//    return _.random(0, max_)
//
//    function getOrder(n) {
//        if (n === 0) throw new Error("Don't know magnitude order of 0")
//        return Math.floor(Math.log10(Math.abs(n)))
//    }
//}
//
//$$.random2 = random2


function decap(arg) {
    console.warn('This method is deprecated in favor of Lodash\'s "_.lowerFirst"')
    return _.lowerFirst.apply(_, arguments)
}

$$.decap = decap


function cycle(arr) {
    cycle._i == null && (cycle._i = 0)
    if (cycle._i < arr.length) {return arr[cycle._i++]} else {cycle._i = 0; return arr[cycle._i++]}
}

$$.cycle = cycle


function isDate(val) {
    if (!(val instanceof Date) && typeof _.get(val, 'toDate') === 'function')
        val = val.toDate()

    return val instanceof Date
}

$$.isDate = isDate


function parseIsoDate(str) {
    var mdate = moment(str, moment.ISO_8601, true)

    if (!mdate.isValid())
        throw new Error('Invalid date')

    return mdate.toDate()
}

$$.parseIsoDate = parseIsoDate


function formatDateIso(date) {
    if (!isDate(date))
        throw new Error('Date expected')

    return moment(date).format('YYYY-MM-DD')
}

$$.formatDateIso = formatDateIso


function isEmpty(val) {
    if (!_.isObject(val))
        return true

    if (val instanceof String)
        return true

    return _.isEmpty(val)
}

$$.isEmpty = isEmpty


function isPresent(val) {
    return !isEmpty(val)
}

$$.isPresent = isPresent


function isSameDay(d1, d2) {
    return moment(d1).isSame(d2, 'day')
}

$$.isSameDay = isSameDay


function isoDate() {
    console.warn('This method is deprecated in favor of "formatDateIso"')
    return formatDateIso.apply(null, arguments)
}

$$.isoDate = isoDate


function joinInc(arr, rep, spacer, divider) {
    rep == null && (rep = '    ')
    spacer == null && (spacer = '')
    divider == null && (divider = '\n')

    var newArr = arr.reduce(function(acc, x, i) {acc.push(x, divider + _.repeat(rep, i + 1) + spacer); return acc}, [])
    newArr.pop()
    return newArr.join('')
}

$$.joinInc = joinInc


function toNumber(val, defaultVal) {
    var nanVal = NaN

    if (arguments.length >= 2)
        nanVal = defaultVal

    if (_.isString(val) && val.trim() === '')
        return nanVal

    var converted = Number(val)
    return _.isNaN(converted) ? nanVal : converted
}

$$.toNumber = toNumber


function timeout(fn, time) {
    time == null && (time = 1000)

    return function() {
        var args = arguments

        return new $.Deferred(function() {
            var that = this
            setTimeout(function() {that.resolve(fn.apply(null, args))}, time)
        })
    }
}

$$.timeout = timeout


function myDebug(namespace) {
    if (typeof debug === 'undefined' || typeof debug !== 'function') {
        console.warn('"debug.js" library is required')
        return
    }

    !_.isPlainObject(myDebug._obj) && (myDebug._obj = {})
    typeof myDebug._obj[namespace] !== 'function' && (myDebug._obj[namespace] = debug(namespace))
    var args = _.drop(arguments, 1)
    myDebug._obj[namespace].apply(null, [''].concat(args))
}

$$.debug = myDebug


function log(arg) {
    console.log(arg)
}

$$.log = log


// Dirty ----------------------------------------------------------

function datesToStr_(obj) {
    return JSON.parse(JSON.stringify(obj, function(k, v) {
        return (this[k] instanceof Date) ? formatDateIso(this[k]) : v
    }))
}

$$.datesToStr_ = datesToStr_


function inspect_() {
    var args = Array.prototype.slice.call(arguments) // Convert to plain array
    var obj = args.shift()
    obj = datesToStr_(obj)
    args.unshift(obj)
    console.log(util.inspect.apply(util, args))
}

$$.inspect_ = inspect_


module.exports = $$

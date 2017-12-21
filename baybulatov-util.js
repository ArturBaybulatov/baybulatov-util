(function() {
    'use strict';


    // Base ---------------------------------------

    //var call = Function.prototype.call.bind(Function.prototype.call);
    //var slice = call.bind(Array.prototype.slice);
    //var toString = call.bind(Object.prototype.toString);

    var toString = Function.call.bind({}.toString);


    // Polyfills ----------------------------------

    if (!('isArray' in Array))
        Array.isArray = function(val) {return toString(val) === '[object Array]'};

    if (!('isNaN' in Number))
        Number.isNaN = function(val) {return val !== val};


    // Utils --------------------------------------

    var util = window.util = {};

    util._version = '1.0.0';


    function curry(fn, arity) {
        curry._version = '1.0';

        arity = arity || fn.length

        return function f1() {
            var args = Array.prototype.slice.call(arguments, 0)

            if (args.length >= arity) {
                return fn.apply(null, args)
            } else {
                return function f2() {
                    var args2 = Array.prototype.slice.call(arguments, 0)
                    return f1.apply(null, args.concat(args2))
                }
            }
        }
    }

    util.curry = curry;


    function formatDate(date) {
        return [pad(date.getDate()), pad(date.getMonth() + 1), date.getFullYear()].join('.');
    }

    util.formatDate = formatDate;


    function formatTime(date) { // There's no JavaScript "time" type
        return [pad(date.getHours()), pad(date.getMinutes())].join(':');
    }

    util.formatTime = formatTime;


    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    util.pad = pad;


    function isSameDay(d1, d2) {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    }

    util.isSameDay = isSameDay;


    function compareNatural(a, b) {
        // http://www.davekoelle.com/alphanum.html

        function chunkify(t) {
            var tz = new Array();
            var x = 0, y = -1, n = 0, i, j;

            while (i = (j = t.charAt(x++)).charCodeAt(0)) {
                var m = (i == 46 || (i >=48 && i <= 57));

                if (m !== n) {
                    tz[++y] = "";
                    n = m;
                }

                tz[y] += j;
            }

            return tz;
        }

        var aa = chunkify(a.toLowerCase());
        var bb = chunkify(b.toLowerCase());

        for (var x = 0; aa[x] && bb[x]; x++) {
            if (aa[x] !== bb[x]) {
                var c = Number(aa[x]), d = Number(bb[x]);

                if (c == aa[x] && d == bb[x])
                    return c - d;
                else
                    return (aa[x] > bb[x]) ? 1 : -1;
            }
        }

        return aa.length - bb.length;
    }

    util.compareNatural = compareNatural;


    function compareNatural2(a, b) {
        // https://github.com/overset/javascript-natural-sort

        var re = /(^([+\-]?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?(?=\D|\s|$))|^0x[\da-fA-F]+$|\d+)/g,
            sre = /^\s+|\s+$/g,   // trim pre-post whitespace
            snre = /\s+/g,        // normalize all whitespace to single ' ' character
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            i = function(s) {
                return (compareNatural.insensitive && ('' + s).toLowerCase() || '' + s).replace(sre, '');
            },
            // convert all to strings strip whitespace
            x = i(a),
            y = i(b),
            // chunk/tokenize
            xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre), 16) || (xN.length !== 1 && Date.parse(x)),
            yD = parseInt(y.match(hre), 16) || xD && y.match(dre) && Date.parse(y) || null,
            normChunk = function(s, l) {
                // normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
                return (!s.match(ore) || l == 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
            },
            oFxNcL, oFyNcL;
        // first try and sort Hex codes or Dates
        if (yD) {
            if (xD < yD) { return -1; }
            else if (xD > yD) { return 1; }
        }
        // natural sorting through split numeric strings and default strings
        for(var cLoc = 0, xNl = xN.length, yNl = yN.length, numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
            oFxNcL = normChunk(xN[cLoc] || '', xNl);
            oFyNcL = normChunk(yN[cLoc] || '', yNl);
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
                return isNaN(oFxNcL) ? 1 : -1;
            }
            // if unicode use locale comparison
            if (/[^\x00-\x80]/.test(oFxNcL + oFyNcL) && oFxNcL.localeCompare) {
                var comp = oFxNcL.localeCompare(oFyNcL);
                return comp / Math.abs(comp);
            }
            if (oFxNcL < oFyNcL) { return -1; }
            else if (oFxNcL > oFyNcL) { return 1; }
        }
    }

    util.compareNatural2 = compareNatural2;


    function compareNatural3(a, b) {
        compareNatural3._version = '1.0';

        return String.prototype.localeCompare.call(a, b, undefined, {numeric: true});
    }

    util.compareNatural3 = compareNatural3;


    function visuallyRandomNumber() {
        visuallyRandomNumber._version = '1.0';

        return _.sample([_.random(1, 9), _.random(10, 99), _.random(100, 999)]);
    }

    util.visuallyRandomNumber = visuallyRandomNumber;


    function randomDate() {
        return new Date(_.random(1990, 2017), _.random(11), _.random(1, 28));
    }

    util.randomDate = randomDate;


    function humanFileSize(size) {
        humanFileSize._version = '1.0';

        var i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B','kB','MB','GB','TB'][i];
    }

    util.humanFileSize = humanFileSize;


    function dateValid(date) {
        return !Number.isNaN(date.getTime());
    }

    util.dateValid = dateValid;


    /**
     * Проверяет, является ли значение `val` числом (по типу). Возвращает `false`, если значение -- `NaN`
     *     или `±Infinity`
     */
    function isNumber(val) {
        isNumber._version = '1.0';

        return typeof val === 'number' && !Number.isNaN(val) && Math.abs(val) !== Infinity;
    }

    util.isNumber = isNumber;


    /**
     * Проверяет, является ли значение `val` числом или строкой, представляющей число. Возвращает `false`,
     *     если значение -- `NaN` или `±Infinity` (касается их строковых представлений тоже)
     */
    function isNumeric(val) {
        isNumeric._version = '1.1';

        if (isNumber(val))
            return true;

        if (val == null)
            return false;

        if (typeof val !== 'string')
            return false;

        val = val.trim();

        if (val === '')
            return false;

        return !Number.isNaN(Number(val));
    }

    util.isNumeric = isNumeric;


    function fromNumeric(val, defaultVal) {
        fromNumeric._version = '0.1';

        if (arguments.length <= 1)
            defaultVal = null;

        return isNumeric(val) ? Number(val) : defaultVal;
    }

    util.fromNumeric = fromNumeric;


    /** Проверяет является ли значение `val` непустой сторкой (при проверке пробелы отсекаются) */
    function isNonEmptyString(val) {
        isNonEmptyString._version = '0.1';
        return typeof val === 'string' && val.trim() !== '';
    }

    util.isNonEmptyString = isNonEmptyString;


    function flat2tree(arr, idKey, parentIdKey, childrenKey) {
        flat2tree._version = '1.0';

        var groups = _.groupBy(arr, function(item) {return item[parentIdKey] == null ? '__root' : item[parentIdKey]});
        arr.forEach(function(item) {delete item[parentIdKey]}); // No need
        var refs = _.keyBy(arr, idKey);

        _.forEach(groups, function(children, groupId) {
            if (groupId !== '__root')
                _.set(refs, [groupId, childrenKey], children);
        });

        return groups['__root'];
    }

    util.flat2tree = flat2tree;


    function generateTree(idKey, parentIdKey, childrenKey, nameKey) {
        generateTree._version = '1.0';

        idKey == null && (idKey = 'id');
        parentIdKey == null && (parentIdKey = 'parentId');
        childrenKey == null && (childrenKey = 'children');
        nameKey == null && (nameKey = 'name');

        var MAX_ITEMS = 101;

        var randoms = _.times(31, function() {return _.random(MAX_ITEMS)});

        var arr = _.shuffle(_.times(MAX_ITEMS, function(i) {
            var r = _.sample(randoms);
            var weightedRandom = _.sample(_(5).times(_.constant(r)).push(null).v);

            var obj = {};

            obj[idKey] = i;
            obj[parentIdKey] = weightedRandom;
            obj[nameKey] = 'Foo-' + i;

            return obj;
        }));

        // Remove circular dependencies:
        arr = JSON.parse(JsonStringifySafe.stringify(arr, null, null, function() {}));

        return flat2tree(arr, idKey, parentIdKey, childrenKey);
    }

    util.generateTree = generateTree;


    function setIfNone(obj, path, val) {
        if (_.get(obj, path) == null)
            _.set(obj, path, val);
    }

    util.setIfNone = setIfNone;


    function lorem(sentenceCount, wordCount) {
        lorem._version = '1.0';

        if (sentenceCount == null)
            sentenceCount = _.random(1, 5);

        if (wordCount == null)
            wordCount = _.random(5, 30);

        var vocab = [
            'a ac adipiscing amet ante arcu at auctor augue bibendum commodo condimentum consectetur consequat convallis curabitur',
            'cursus diam dictum dignissim dolor donec duis efficitur eget eleifend elit enim erat et eu ex facilisis faucibus feugiat',
            'finibus gravida iaculis id imperdiet in integer ipsum lacinia lacus laoreet lectus leo libero ligula lobortis lorem',
            'luctus maecenas mauris metus mi mollis morbi nam nec neque nisi non nulla nullam nunc odio orci ornare pellentesque',
            'pharetra phasellus porta porttitor posuere pretium proin pulvinar purus quam quis rhoncus rutrum sapien sed sem semper',
            'sit sollicitudin tempor tempus tincidunt tortor turpis ullamcorper ultricies ut varius vehicula vel velit vestibulum',
            'vitae viverra volutpat vulputate',
        ].join(' ').split(' ');

        return _.times(sentenceCount, function() {
            return _(vocab).sampleSize(wordCount).join(' ').capitalize().v;
        }).join('. ');
    }

    util.lorem = lorem;


    function morph(number, words) {
        morph._version = '1.0';

        var CHOICES = [2, 0, 1, 1, 1, 2];

        if (number % 100 > 4 && number % 100 < 20) {
            var choice = 2;
        } else {
            var i = number % 10 < 5 ? number % 10 : 5;
            var choice = CHOICES[i];
        }

        return words[choice];
    }

    util.morph = morph;


    function randomIdent(size) {
        randomIdent._version = '1.0';

        if (size == null)
            size = 8;

        if (!isNumeric(size))
            return;

        size = Number(size);

        var alpha = 'abcdefghijklmnopqrstuvwxyz';
        var chars = alpha + alpha.toUpperCase() + '0123456789';

        if (size === 0)
            return '';

        if (size > 0)
            return _(alpha).sample().concat(_.sampleSize(chars, size - 1)).join('').v;
    }

    util.randomIdent = randomIdent;


    function cycle(arr) {
        cycle._version = '1.0';

        cycle._i == null && (cycle._i = 0)
        if (cycle._i < arr.length) {return arr[cycle._i++]} else {cycle._i = 0; return arr[cycle._i++]}
    }

    util.cycle = cycle;


    function timeout(fn, time) {
        timeout._version = '1.1';

        if (time == null)
            time = 1000;

        return function() {
            var context = this;
            var args = arguments;

            return new $.Deferred(function() {
                var that = this;
                window.setTimeout(function() { that.resolve(fn.apply(context, args)) }, time);
            });
        };
    }

    util.timeout = timeout;


    function sortTree(items, sortKey, childrenKey) {
        sortTree._version = '1.3';

        sortKey == null && (console.warn('No sort key provided'), sortKey = 'order');
        childrenKey == null && (childrenKey = 'children');

        items = _.sortBy(items, sortKey);

        items.forEach(function(item) {
            if (item[childrenKey] == null)
                return;

            item[childrenKey] = sortTree(item[childrenKey], sortKey, childrenKey);
        });

        return items;
    }

    util.sortTree = sortTree;


    /** Пытается распарсить JSON-строку, в случае ошибки возвращает `null` */
    function tryParseJsonOrNull(json) {
        tryParseJsonOrNull._version = '0.2';

        try {
            return JSON.parse(json);
        } catch (err) {
            return null;
        }
    }

    util.tryParseJsonOrNull = tryParseJsonOrNull;


    /** Удостоверяется, что условие `cond === true`, иначе выбрасывает ошибку с сообщением `errMsg` */
    function ensure(cond, errMsg) {
        ensure._version = '0.2';

        if (typeof cond !== 'boolean')
            throw new Error('Boolean expected');

        if (cond !== true)
            throw new Error(errMsg);
    }

    util.ensure = ensure;


    /**
     * Разделяет строку `str` на две части по первому попавшемуся разделителю `sep` (тоже строка).
     * Возвращает массив из двух строк. Сам разделитель из результатов убирается.
     * Если разделитель не найден, возвращает `['', str]`
     */
    function splitOnFirst(str, sep) {
        splitOnFirst._version = '0.1';
        ensure(typeof str === 'string' && typeof sep === 'string', 'String expected');
        return [str.substr(0, str.indexOf(sep)), str.substr(str.indexOf(sep) + 1)];
    }

    util.splitOnFirst = splitOnFirst;
}());

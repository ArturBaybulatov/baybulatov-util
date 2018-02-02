(function() {
    'use strict';


    // Base ---------------------------------------

    var toString = Function.call.bind({}.toString);
    var slice = Function.call.bind([].slice);


    // Polyfills ----------------------------------

    if (!('isArray' in Array))
        Array.isArray = function(val) { return toString(val) === '[object Array]' };

    if (!('isNaN' in Number))
        Number.isNaN = function(val) { return val !== val };


    // Utils --------------------------------------

    var util = window.util = {};

    util._version = '0.2.0';


    var curry = util.curry = function(fn, arity) {
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
    };


    var formatDate = util.formatDate = function(date) {
        return [pad(date.getDate()), pad(date.getMonth() + 1), date.getFullYear()].join('.');
    };


    var formatTime = util.formatTime = function(date) { // There's no JavaScript "time" type
        return [pad(date.getHours()), pad(date.getMinutes())].join(':');
    };


    var pad = util.pad = function(n) {
        return n < 10 ? '0' + n : n;
    };


    var isSameDay = util.isSameDay = function(d1, d2) {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };


    var isSameStringI = util.isSameStringI = function(str1, str2) {
        isSameStringI._version = '0.2';

        if (typeof str1 !== 'string' || typeof str2 !== 'string')
            return false;

        return str1.trim().toUpperCase() === str2.trim().toUpperCase();
    };


    var compareNatural = util.compareNatural = function(a, b) {
        // http://www.davekoelle.com/alphanum.html

        function chunkify(t) {
            var tz = new Array();
            var x = 0, y = -1, n = 0, i, j;

            while (i = (j = t.charAt(x++)).charCodeAt(0)) {
                var m = (i == 46 || (i >= 48 && i <= 57));

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
    };


    var compareNatural2 = util.compareNatural2 = function(a, b) {
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
            xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
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
        for (var cLoc = 0, xNl = xN.length, yNl = yN.length, numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
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
    };


    var compareNatural3 = util.compareNatural3 = function(a, b) {
        compareNatural3._version = '1.0';

        return String.prototype.localeCompare.call(a, b, undefined, { numeric: true });
    };


    var visuallyRandomNumber = util.visuallyRandomNumber = function() {
        visuallyRandomNumber._version = '1.0';

        return _.sample([_.random(1, 9), _.random(10, 99), _.random(100, 999)]);
    };


    var randomDate = util.randomDate = function() {
        return new Date(_.random(1990, 2017), _.random(11), _.random(1, 28));
    };


    var humanFileSize = util.humanFileSize = function(size) {
        humanFileSize._version = '1.0';

        var i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };


    var dateValid = util.dateValid = function(date) {
        return !Number.isNaN(date.getTime());
    };


    /**
     * Проверяет, является ли значение `val` числом (по типу). Возвращает `false`, если значение -- `NaN`
     *     или `±Infinity`
     */
    var isNumber = util.isNumber = function(val) {
        isNumber._version = '1.0';

        return typeof val === 'number' && !Number.isNaN(val) && Math.abs(val) !== Infinity;
    };


    /**
     * Проверяет, является ли значение `val` числом или строкой, представляющей число. Возвращает `false`,
     *     если значение -- `NaN` или `±Infinity` (касается их строковых представлений тоже)
     */
    var isNumeric = util.isNumeric = function(val) {
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
    };


    var fromNumeric = util.fromNumeric = function(val, defaultVal) {
        fromNumeric._version = '0.1';

        if (arguments.length <= 1)
            defaultVal = null;

        return isNumeric(val) ? Number(val) : defaultVal;
    };


    /** Проверяет является ли значение `val` непустой сторкой (при проверке пробелы отсекаются) */
    var isNonEmptyString = util.isNonEmptyString = function(val) {
        isNonEmptyString._version = '0.1';
        return typeof val === 'string' && val.trim() !== '';
    };


    var isNonEmptyArray = util.isNonEmptyArray = function(val) {
        isNonEmptyArray._version = '0.1';
        return Array.isArray(val) && val.length !== 0;
    };


    var isJqElement = util.isJqElement = function(val) {
        isJqElement._version = '0.2';
        return val instanceof jQuery && val.length === 1; // Only one expected
    };


    var isNonEmptyJqCollection = util.isNonEmptyJqCollection = function(val) {
        isNonEmptyJqCollection._version = '0.1';
        return val instanceof jQuery && val.length !== 0;
    };


    var flat2tree = util.flat2tree = function(arr, idKey, parentIdKey, childrenKey) {
        flat2tree._version = '1.0';

        var groups = _.groupBy(arr, function(item) { return item[parentIdKey] == null ? '__root' : item[parentIdKey] });
        arr.forEach(function(item) { delete item[parentIdKey] }); // No need
        var refs = _.keyBy(arr, idKey);

        _.forEach(groups, function(children, groupId) {
            if (groupId !== '__root')
                _.set(refs, [groupId, childrenKey], children);
        });

        return groups['__root'];
    };


    var generateTree = util.generateTree = function(idKey, parentIdKey, childrenKey, nameKey) {
        generateTree._version = '1.0';

        idKey == null && (idKey = 'id');
        parentIdKey == null && (parentIdKey = 'parentId');
        childrenKey == null && (childrenKey = 'children');
        nameKey == null && (nameKey = 'name');

        var MAX_ITEMS = 101;

        var randoms = _.times(31, function() { return _.random(MAX_ITEMS) });

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
        arr = JSON.parse(JsonStringifySafe.stringify(arr, null, null, function() { }));

        return flat2tree(arr, idKey, parentIdKey, childrenKey);
    };


    var setIfNone = util.setIfNone = function(obj, path, val) {
        if (_.get(obj, path) == null)
            _.set(obj, path, val);
    };


    var lorem = util.lorem = function(sentenceCount, wordCount) {
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
    };


    var morph = util.morph = function(number, words) {
        morph._version = '1.0';

        var CHOICES = [2, 0, 1, 1, 1, 2];

        if (number % 100 > 4 && number % 100 < 20) {
            var choice = 2;
        } else {
            var i = number % 10 < 5 ? number % 10 : 5;
            var choice = CHOICES[i];
        }

        return words[choice];
    };


    var randomIdent = util.randomIdent = function(size) {
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
    };


    var cycle = util.cycle = function(arr) {
        cycle._version = '1.0';

        cycle._i == null && (cycle._i = 0)
        if (cycle._i < arr.length) { return arr[cycle._i++] } else { cycle._i = 0; return arr[cycle._i++] }
    };


    var timeout = util.timeout = function(fn, time) {
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
    };


    var sortTree = util.sortTree = function(items, sortKey, childrenKey) {
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
    };


    /** Пытается распарсить JSON-строку, в случае ошибки возвращает `null` */
    var tryParseJsonOrNull = util.tryParseJsonOrNull = function(json) {
        tryParseJsonOrNull._version = '0.2';

        try {
            return JSON.parse(json);
        } catch (err) {
            return null;
        }
    };


    /** Удостоверяется, что условие `cond === true`, иначе выбрасывает ошибку с сообщением `errMsg` */
    var ensure = util.ensure = function(cond, errMsg) {
        ensure._version = '0.2';

        if (typeof cond !== 'boolean')
            throw new TypeError('Boolean expected');

        if (cond !== true)
            throw new TypeError(errMsg);
    };

    ensure.maybe = {};

    _ensurify('function', function(val) { return typeof val === 'function' }, 'Function');
    _ensurify('boolean', function(val) { return typeof val === 'boolean' }, 'Boolean');
    _ensurify('string', function(val) { return typeof val === 'string' }, 'String');
    _ensurify('jqCollection', function(val) { return val instanceof jQuery }, 'jQuery collection');
    _ensurify('nonEmptyString', isNonEmptyString, 'Non-empty string');
    _ensurify('number', isNumber, 'Number');
    _ensurify('numeric', isNumeric, 'Numeric');
    _ensurify('object', _.isObject, 'Object');
    _ensurify('plainObject', _.isPlainObject, 'Plain object');
    _ensurify('array', Array.isArray, 'Array');
    _ensurify('nonEmptyArray', isNonEmptyArray, 'Non-empty array');
    _ensurify('jqElement', isJqElement, 'jQuery element');
    _ensurify('nonEmptyJqCollection', isNonEmptyJqCollection, 'Non-empty jQuery collection');

    function _ensurify(identifier, predicate, type) {
        ensure(isNonEmptyString(identifier), 'Non-empty string expected');
        ensure(typeof predicate === 'function', 'Function expected');
        ensure(isNonEmptyString(type), 'Non-empty string expected');

        ensure[identifier] = function() {
            var vals = slice(arguments);
            ensure(isNonEmptyArray(vals), 'Non-empty array expected');

            vals.forEach(function(val) { ensure(predicate(val), type + ' expected') });

            if (vals.length === 1)
                return vals[0];
        };

        ensure.maybe[identifier] = function() {
            var vals = slice(arguments);
            ensure(isNonEmptyArray(vals), 'Non-empty array expected');

            vals.forEach(function(val) {
                ensure(predicate(val) || val == null, type + ' or null-like expected');
            });

            if (vals.length === 1)
                return vals[0];
        };
    };


    /**
     * Разделяет строку `str` на две части по первому попавшемуся разделителю `sep` (тоже строка).
     * Возвращает массив из двух строк. Сам разделитель из результатов убирается.
     * Если разделитель не найден, возвращает `['', str]`
     */
    var splitOnFirst = util.splitOnFirst = function(str, sep) {
        splitOnFirst._version = '0.1';
        ensure(typeof str === 'string' && typeof sep === 'string', 'String expected');
        return [str.substr(0, str.indexOf(sep)), str.substr(str.indexOf(sep) + 1)];
    };


    var responseToError = util.responseToError = function(res) {
        responseToError._version = '0.1';

        var msg = res.status + ' ' + res.statusText;

        if (isNonEmptyString(res.responseText))
            msg += '\n\n' + res.responseText.split('\n', 5).join('\n');

        throw new Error(msg);
    };


    var handleRejection = util.handleRejection = function(msg, verbose) {
        handleRejection._version = '0.5';

        ensure.nonEmptyString(msg);
        ensure.maybe.boolean(verbose);

        return function(err) {
            var details = err.message;

            if (!isNonEmptyString(details)) {
                details = msg;
                msg = 'Ошибка';
            }

            if (_.isObject(window.toastr) && typeof toastr.error === 'function')
                toastr.error(details, msg);
            else
                alert.error(msg, details);

            if (verbose)
                console.error(err);
        };
    };


    var confirm = util.confirm = function(title, body, onAccept, onDeny) {
        ensure.nonEmptyString(title, body);
        ensure.function(onAccept);
        ensure.maybe.function(onDeny);

        var $dialog = $('<p>', { attr: { title: title }, text: body, css: { lineHeight: '1.4em' } });
        var buttons = { 'ОК': onAccept.bind(null, $dialog) };

        buttons['Отмена'] = typeof onDeny === 'function'
            ? onDeny.bind(null, $dialog)
            : function() { $dialog.dialog('close') };

        $dialog.dialog({ modal: true, show: { effect: 'fade' }, hide: { effect: 'fade' }, buttons: buttons });
    };


    var $popup = $('<div>', { attr: { 'js-popup': '' } });

    $popup.dialog({
        modal: true,
        resizable: false,
        draggable: false,
        autoOpen: false,
        width: 'auto',
        height: 'auto',
        //show: 'fade',
        //hide: 'fade',
    });

    /**
     * var log = _.unary(console.log); // Debug
     * var $popupContent = $('<input>');
     *
     * var $popup = popup('This is example title', $popupContent, {
     *     open: function() { log('Popup opened') },
     *     ok: function($popup) { log('OK button clicked'); $popup.dialog('close') },
     *     cancel: function($popup) { log('Cancel button clicked'); $popup.dialog('close') },
     *     close: function() { log('Popup closed') },
     * });
     */
    var popup = util.popup = function(title, $content, args) {
        ensure.nonEmptyString(title);
        ensure.nonEmptyJqCollection($content);
        ensure.maybe.plainObject(args);

        if (!_.isPlainObject(args))
            args = {};

        ensure.maybe.function(args.open, args.ok, args.cancel, args.close);
        $popup.dialog('option', 'title', title);
        $popup.html($content);

        if (typeof args.open === 'function')
            $popup.dialog('option', 'open', args.open.bind(null, $popup));

        if (typeof args.close === 'function')
            $popup.dialog('option', 'close', args.close.bind(null, $popup));

        var buttons = [];

        if (typeof args.ok === 'function')
            buttons.push({ text: 'OK', click: args.ok.bind(null, $popup), attr: { 'js-ok-btn': '' } });

        if (typeof args.cancel === 'function')
            buttons.push({ text: 'Отмена', click: args.cancel.bind(null, $popup) });
        else
            buttons.push({ text: 'Закрыть', click: function() { $popup.dialog('close') } });

        if (isNonEmptyArray(buttons))
            $popup.dialog('option', 'buttons', buttons);

        $popup.dialog('open');
    };


    var $spinner = $('<div>', {
        html: [
            $('<div>', { class: 'spinner' }),
            $('<input>', { attr: { type: 'checkbox' }, css: { position: 'absolute', opacity: 0, zIndex: -1 } }),
        ],
    });

    $spinner.dialog({
        classes: { 'ui-dialog': 'spinner-dialog' },
        modal: true,
        resizable: false,
        draggable: false,
        closeOnEscape: false,
        autoOpen: false,
        width: 'auto',
        height: 'auto',
        //show: 'fade',
        //hide: 'fade',
    });

    var block = util.block = function() { $spinner.dialog('open') };

    var unblock = util.unblock = function() { $spinner.dialog('close') };
}());

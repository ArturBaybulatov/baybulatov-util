export const NoSuchPathError = function(msg) { this.message = msg };
NoSuchPathError.prototype = Object.create(Error.prototype);


export const HttpAuthError = function(msg) { this.message = msg };
HttpAuthError.prototype = Object.create(Error.prototype);


export const formatDate = function(date) {
    ensure.date(date);

    return [pad(date.getFullYear(), 4), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
};


export const formatDateRu = function(date) {
    ensure.date(date);

    return [pad(date.getDate()), pad(date.getMonth() + 1), pad(date.getFullYear(), 4)].join('.');
};


export const formatTime = function(date, full) { // There's no JavaScript "time" type
    ensure.date(date);
    ensure.maybe.boolean(full);

    return [pad(date.getHours()), pad(date.getMinutes()), full ? pad(date.getSeconds()) : null]
        .filter(function(x) { return x != null })
        .join(':');
};


export const formatDuration = function(duration, full) {
    ensure.nonNegativeNumber(duration); // Seconds
    ensure.maybe.boolean(full);

    var date = new Date(new Date('0001-01-01T00:00:00').getTime() + duration * 1000);
    var hours = dateFns.differenceInHours(date, new Date('0001-01-01T00:00:00'));

    return [
        full ? pad(hours) : hours === 0 ? null : pad(hours),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
    ].filter(function(x) { return x != null }).join(':');
};


export const pad = function(n, len) {
    ensure.nonNegativeInteger(n);
    return n.toString().padStart(isPositiveInteger(len) ? len : 2, '0');
};


export const isSameDay = function(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};


export const isSameStringI = function(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string')
        return false;

    return str1.trim().toUpperCase() === str2.trim().toUpperCase();
};


export const isSamePath = function(p1, p2) {
    console.warn('Deprecated?');

    // Use `new URL(relativePath, location.href).pathname === location.pathname`

    // Or use: `var a = document.createElement('a'); a.href = 'http://xxx/'; var relPath = '../about/'; a.pathname = `${location.pathname}${relPath}`; a.pathname === location.pathname`
    // IE requires a hack: `a.pathname.replace(/^\/?/, '/') === location.pathname`

    ensure.string(p1, p2);

    p1 = p1.trim().replace(/\/$/, '');
    p2 = p2.trim().replace(/\/$/, '');

    return isSameStringI(p1, p2);
};


export const compareNatural = function(a, b) {
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


export const compareNatural2 = function(a, b) {
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


export const compareNatural3 = function(a, b) {
    return String.prototype.localeCompare.call(a, b, undefined, { numeric: true });
};


export const visuallyRandomNumber = function() {
    return _.sample([_.random(1, 9), _.random(10, 99), _.random(100, 999)]);
};


export const randomDate = function() {
    return new Date(_.random(1990, 2017), _.random(11), _.random(1, 28));
};


export const humanFileSize = function(size) {
    var i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};


export const isDate = function(val) {
    return val instanceof Date && isNumber(val.getTime());
};


export const isNumber = function(val) {
    return typeof val === 'number' && isFinite(val);
};


export const isPositiveNumber = function(val) {
    return isNumber(val) && val > 0;
};


export const isNonNegativeNumber = function(val) {
    return isNumber(val) && val >= 0;
};


export const isPositiveInteger = function(val) {
    return Number.isInteger(val) && val > 0;
};


export const isNonNegativeInteger = function(val) {
    return Number.isInteger(val) && val >= 0;
};


export const isHexColorString = function(val) {
    return isNonEmptyString(val) && /^#[0-9a-f]{6}$/i.test(val);
};


export const isPixelValueString = function(val) {
    return isNonEmptyString(val) && /^(\d+|\d+\.\d+)px$/.test(val);
};


export const isEmail = function(val) {
    return isNonEmptyString(val) && /^[a-z0-9_\-]+(\.[a-z0-9_\-]+)*@[a-z0-9-]+(\.[a-z]+)+$/i.test(val);
};


export const isNumeric = function(val) {
    if (isNumber(val))
        return true;

    if (typeof val !== 'string')
        return false;

    val = val.trim();

    if (val === '')
        return false;

    return isNumber(Number(val));
};


export const fromNumeric = function(val, defaultVal) {
    console.warn('Deprecated in favor of `const result = util.isNumeric(val) ? Number(val) : defaultVal`?');

    if (arguments.length <= 1)
        defaultVal = null;

    return isNumeric(val) ? Number(val) : defaultVal;
};


export const isNonEmptyString = function(val) {
    return typeof val === 'string' && val.trim() !== '';
};


export const addBemModifier = function(cls, modifier) {
    ensure.nonEmptyString(cls, modifier);
    ensure(hasNoWhitespaces(cls), 'String with no whitespaces expected');
    ensure(hasNoWhitespaces(modifier), 'String with no whitespaces expected');

    return cls + ' ' + cls + '--' + modifier;
};


export const hasNoWhitespaces = function(s, strict) {
    ensure.string(s);
    ensure.maybe.boolean(strict);

    if (!strict) s = s.trim();
    return s.split(/\s/).length === 1;
};


export const isNonEmptyArray = function(val) {
    return Array.isArray(val) && val.length !== 0;
};


export const flat2tree = function(arr, idKey, parentIdKey, childrenKey) {
    var groups = _.groupBy(arr, function(item) { return item[parentIdKey] == null ? '__root' : item[parentIdKey] });
    arr.forEach(function(item) { delete item[parentIdKey] }); // No need
    var refs = _.keyBy(arr, idKey);

    _.forEach(groups, function(children, groupId) {
        if (groupId !== '__root')
            _.set(refs, [groupId, childrenKey], children);
    });

    return groups['__root'];
};


export const generateTree = function(depth, nameKey, childrenKey) {
    ensure.nonNegativeInteger(depth);
    ensure.maybe.nonEmptyString(nameKey, childrenKey);

    if (!isNonEmptyString(nameKey)) nameKey = 'name';
    if (!isNonEmptyString(childrenKey)) childrenKey = 'children';

    return _.times(_.random(3, 6), function() {
        var obj = {};
        obj[nameKey] = lorem(1, _.random(1, 4));

        if (_.sample([true, false]) && depth - 1 !== 0)
            obj[childrenKey] = generateTree(depth - 1, nameKey, childrenKey);

        return obj;
    });
};


export const getPath = function(obj, path) {
    ensure.plainObject(obj);
    ensure.array(path);

    for (var i = 0; i < path.length; i++) {
        var fragm = path[i];
        ensure.nonEmptyString(fragm);

        if (!Array.isArray(obj.children))
            throw new NoSuchPathError();

        obj = obj.children.find(function(x) { return x.name === fragm });

        if (!_.isPlainObject(obj))
            throw new NoSuchPathError();
    }

    return obj;
};


export const setPath = function(obj, path, data) {
    ensure.plainObject(obj);
    ensure.array(path);

    var item = obj;

    for (var i = 0; i < path.length; i++) {
        var fragm = path[i];
        ensure.nonEmptyString(fragm);

        if (Array.isArray(item.children)) {
            var foundItem = item.children.find(function(x) { return x.name === fragm });

            if (_.isPlainObject(foundItem)) {
                item = foundItem;
            } else {
                var newObject = { name: fragm };
                item.children.push(newObject);
                item = newObject;
            }
        } else {
            var newObject = { name: fragm };
            item.children = [newObject];
            item = newObject;
        }
    }

    item.data = data;

    return obj;
};


export const lorem = function(sentenceCount, wordCount) {
    if (sentenceCount == null)
        sentenceCount = _.random(1, 5);

    var vocab = [
        'a ac adipiscing amet ante arcu at auctor augue bibendum commodo condimentum consectetur consequat convallis curabitur',
        'cursus diam dictum dignissim dolor donec duis efficitur eget eleifend elit enim erat et eu ex facilisis faucibus feugiat',
        'finibus gravida iaculis id imperdiet in integer ipsum lacinia lacus laoreet lectus leo libero ligula lobortis lorem',
        'luctus maecenas mauris metus mi mollis morbi nam nec neque nisi non nulla nullam nunc odio orci ornare pellentesque',
        'pharetra phasellus porta porttitor posuere pretium proin pulvinar purus quam quis rhoncus rutrum sapien sed sem semper',
        'sit sollicitudin tempor tempus tincidunt tortor turpis ullamcorper ultricies ut varius vehicula vel velit vestibulum',
        'vitae viverra volutpat vulputate',
    ].join(' ').split(' ');

    //var vocab = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'.split(''); // Debug

    return _.times(sentenceCount, function() {
        var currentWordCount = wordCount == null ? _.random(5, 30) : wordCount;
        return _(vocab).sampleSize(currentWordCount).join(' ').capitalize().v;
    }).join('. ');
};


export const morph = function(number, words) {
    var CHOICES = [2, 0, 1, 1, 1, 2];

    if (number % 100 > 4 && number % 100 < 20) {
        var choice = 2;
    } else {
        var i = number % 10 < 5 ? number % 10 : 5;
        var choice = CHOICES[i];
    }

    return words[choice];
};



export const spellNumberRu = function(num, feminine) {
    // Original: http://shpargalkablog.ru/2017/05/writing-number-letters.html


    ensure(Number.isSafeInteger(num) && num >= 0, 'Safe non-negative integer expected'); // TODO: Support big numbers
    ensure.maybe.boolean(feminine);


    num = num.toString();


    var result = '';

    var names = [
        [null, 'тысяч', 'миллион', 'миллиард', 'триллион', 'квадриллион', 'квинтиллион', 'секстиллион', 'септиллион', 'октиллион', 'нониллион', 'дециллион'],
        ['а', 'и', ''],
        ['', 'а', 'ов'],
    ];

    if (num == '' || num == '0') return 'ноль';

    num = num.split(/(?=(?:\d{3})+$)/); // Разбить число в массив с трёхзначными числами

    if (num[0].length == 1) num[0] = '00' + num[0];
    if (num[0].length == 2) num[0] = '0' + num[0];

    for (var j = num.length - 1; j >= 0; j--) { // Соединить трёхзначные числа в одно число, добавив названия разрядов с окончаниями
        if (num[j] == '000') continue;

        result = (
            ((feminine && j == num.length - 1) || j == num.length - 2)
                && (num[j][2] == '1' || num[j][2] == '2')
                    ? spellNumberGroupRu(num[j], true)
                    : spellNumberGroupRu(num[j])
        ) + morph2(
            num[j],
            names[0][num.length - 1 - j],
            j == num.length - 2 ? names[1] : names[2]
        ) + result;
    }

    return result.trim();
};


export const spellNumberGroupRu = function(num, feminine) {
    ensure(ensure.string(num).length === 3, 'String of exactly length = 3 expected');
    ensure.nonNegativeInteger(Number(ensure.numeric(num)));

    ensure.maybe.boolean(feminine);


    var names = [
        ['', ' один', ' два', ' три', ' четыре', ' пять', ' шесть', ' семь', ' восемь', ' девять'],
        [' десять', ' одиннадцать', ' двенадцать', ' тринадцать', ' четырнадцать', ' пятнадцать', ' шестнадцать', ' семнадцать', ' восемнадцать', ' девятнадцать'],
        ['', '', ' двадцать', ' тридцать', ' сорок', ' пятьдесят', ' шестьдесят', ' семьдесят', ' восемьдесят', ' девяносто'],
        ['', ' сто', ' двести', ' триста', ' четыреста', ' пятьсот', ' шестьсот', ' семьсот', ' восемьсот', ' девятьсот'],
        ['', ' одна', ' две'],
    ];


    return names[3][num[0]] + (num[1] == 1 ? names[1][num[2]] : names[2][num[1]] + (feminine ? names[4][num[2]] : names[0][num[2]]));
};


export const morph2 = function(num, root, suffixes) {
    ensure.nonNegativeInteger(Number(ensure.numeric(ensure.string(num))));
    ensure.maybe.string(root);
    ensure(ensure.array(suffixes).length === 3, 'Array of length = 3 expected');


    var rules = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2];
    if (root == null) return '';
    return ' ' + root + (num[num.length - 2] == '1' ? suffixes[2] : suffixes[rules[num[num.length - 1]]]);
};



export const randomIdent = function(size) {
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


export const sortTree = function(items, sortKey, childrenKey) {
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


export const ensure = function(cond, errMsg) {
    if (typeof cond !== 'boolean')
        throw new TypeError('Boolean expected');

    if (cond !== true)
        throw new TypeError(errMsg);
};

ensure.maybe = {};

_ensurify('function', function(val) { return typeof val === 'function' }, 'Function');
_ensurify('boolean', function(val) { return typeof val === 'boolean' }, 'Boolean');
_ensurify('string', function(val) { return typeof val === 'string' }, 'String');
_ensurify('nonEmptyString', isNonEmptyString, 'Non-empty string');
_ensurify('number', isNumber, 'Number');
_ensurify('positiveNumber', isPositiveNumber, 'Positive number');
_ensurify('nonNegativeNumber', isNonNegativeNumber, 'Non-negative number');
_ensurify('integer', Number.isInteger, 'Integer');
_ensurify('positiveInteger', isPositiveInteger, 'Positive integer');
_ensurify('nonNegativeInteger', isNonNegativeInteger, 'Non-negative integer');
_ensurify('numeric', isNumeric, 'Numeric');
_ensurify('object', _.isObject, 'Object');
_ensurify('plainObject', _.isPlainObject, 'Plain object');
_ensurify('array', Array.isArray, 'Array');
_ensurify('nonEmptyArray', isNonEmptyArray, 'Non-empty array');
_ensurify('date', isDate, 'Valid date');
_ensurify('hexColorString', isHexColorString, 'Hex color string');
_ensurify('pixelValueString', isPixelValueString, 'Pixel value string');
_ensurify('email', isEmail, 'E-mail');

function _ensurify(identifier, predicate, type) {
    ensure(isNonEmptyString(identifier), 'Non-empty string expected');
    ensure(typeof predicate === 'function', 'Function expected');
    ensure(isNonEmptyString(type), 'Non-empty string expected');

    ensure[identifier] = function() {
        var vals = [].slice.call(arguments);
        ensure(isNonEmptyArray(vals), 'Non-empty array expected');

        vals.forEach(function(val) { ensure(predicate(val), type + ' expected') });

        if (vals.length === 1)
            return vals[0];
    };

    ensure.maybe[identifier] = function() {
        var vals = [].slice.call(arguments);
        ensure(isNonEmptyArray(vals), 'Non-empty array expected');

        vals.forEach(function(val) {
            ensure(predicate(val) || val == null, type + ' or null-like expected');
        });

        if (vals.length === 1)
            return vals[0];
    };
}


export const splitOnFirst = function(str, sep) {
    ensure(typeof str === 'string' && typeof sep === 'string', 'String expected');
    return [str.substr(0, str.indexOf(sep)), str.substr(str.indexOf(sep) + 1)];
};


export const handleRejection = function(msg) {
    ensure.nonEmptyString(msg);

    return function(err) {
        if (err instanceof HttpAuthError) msg = 'Authentication problem. Try logging in (again)';

        if (_.isObject(toastr)) toastr.error(err.message, msg);
        else alert(msg + '\n\n' + err.message);

        throw err;
    };
};


export const responseToError = function(res) {
    ensure.object(res);


    if (res.status >= 500) throw new Error(res.status + ' ' + res.statusText);


    var msg = _.truncate(res.responseText, { length: 100 });

    if (res.status === 401) throw new HttpAuthError(msg);
    else throw new Error(msg);
};


export const uriEncodeJson = function(val) {
    return encodeURIComponent(JSON.stringify(val));
};


export const uriDecodeJson = function(str) {
    ensure.string(str);
    str = str.replace(/^#/, '');
    var json = decodeURIComponent(str);
    try { return JSON.parse(json) } catch (err) {}
};


export const lightenColor = function(hexColorStr, percentage) {
    ensure.hexColorString(hexColorStr);
    ensure.number(percentage);
    ensure(percentage >= -1 && percentage <= 1, 'A percentage between -1 and 1 expected');

    var amount = ensure.integer(Math.round(255 * percentage));

    hexColorStr = hexColorStr.slice(1); // Strip the hash symbol

    var num = parseInt(hexColorStr, 16);

    var r = (num >> 16) + amount;

    if (r > 255) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00ff) + amount;

    if (b > 255) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000ff) + amount;

    if (g > 255) g = 255;
    else if  (g < 0) g = 0;

    return '#' + ('00000' + (g | (b << 8) | (r << 16)).toString(16)).substr(-6);
};


export const joinPaths = function(path1, path2) {
    // Deprecate in favor of URI.js `new URI(path2, path1).path()` instead?

    ensure.string(path1, path2);

    return _.tap(document.createElement('a'), function(a) {
        a.href = 'http://xxx/';
        a.pathname = path1 + path2;
    }).pathname.replace(/^\/?/, '/');
};


export const svg = function(id) {
    ensure.nonEmptyString(id);
    ensure(id[0] !== '#', 'ID without hash symbol expected');


    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const useElem = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElem.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);

    svgElem.appendChild(useElem);

    return svgElem;
};


export const colorToRgb = function(color) {
    console.warn('Experimental');

    ensure.nonEmptyString(color);

    const span = document.createElement('span');

    span.style.color = color;
    span.style.display = 'none';

    document.body.appendChild(span);

    const rgbColor = window.getComputedStyle(span).color;

    document.body.removeChild(span);

    return rgbColor;
};



// If jQuery --------------------------------------------

export const isJqElement = function(val) {
    return val instanceof jQuery && val.length === 1; // Only one expected
};

export const isNonEmptyJqCollection = function(val) {
    return val instanceof jQuery && val.length !== 0;
};


_ensurify('jqCollection', function(val) { return val instanceof jQuery }, 'jQuery collection');
_ensurify('jqElement', isJqElement, 'jQuery element');
_ensurify('nonEmptyJqCollection', isNonEmptyJqCollection, 'Non-empty jQuery collection');



var $body = $('body');

var $overlay = $('<div>', { class: 'overlay', html: $('<div>', { class: 'overlay__text', attr: { 'js-text': '' } }) });
$body.append($overlay.hide());

export const showOverlay = function(str, isHtml) {
    ensure.nonEmptyString(str);
    ensure.maybe.boolean(isHtml);

    if (isHtml)
        $overlay.find('[js-text]').html(str);
    else
        $overlay.find('[js-text]').text(str);

    $overlay.stop().fadeIn();
};

export const hideOverlay = function() { $overlay.stop().fadeOut() };

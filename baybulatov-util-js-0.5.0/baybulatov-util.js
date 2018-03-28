(function() {
    'use strict';

    var toString = Function.call.bind({}.toString);
    var slice = Function.call.bind([].slice);

    var util = window.util = {};
    util._version = '0.5.0';

    var NoSuchPathError = util.NoSuchPathError = function(msg) { this.message = msg };
    NoSuchPathError.prototype = Object.create(Error.prototype);


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
        return String.prototype.localeCompare.call(a, b, undefined, { numeric: true });
    };


    var visuallyRandomNumber = util.visuallyRandomNumber = function() {
        return _.sample([_.random(1, 9), _.random(10, 99), _.random(100, 999)]);
    };


    var randomDate = util.randomDate = function() {
        return new Date(_.random(1990, 2017), _.random(11), _.random(1, 28));
    };


    var humanFileSize = util.humanFileSize = function(size) {
        var i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };


    var dateValid = util.dateValid = function(date) {
        return isNumber(date.getTime());
    };


    /** Проверяет, является ли значение `val` реальным числом (в т.ч. по типу) */
    var isNumber = util.isNumber = function(val) {
        return typeof val === 'number' && isFinite(val);
    };


    var isPositiveInteger = util.isPositiveInteger = function(val) {
        return Number.isInteger(val) && val > 0;
    };


    var isNonNegativeInteger = util.isNonNegativeInteger = function(val) {
        return Number.isInteger(val) && val >= 0;
    };


    /** Проверяет, является ли значение `val` реальным числом или строкой, его представляющей */
    var isNumeric = util.isNumeric = function(val) {
        if (isNumber(val))
            return true;

        if (typeof val !== 'string')
            return false;

        val = val.trim();

        if (val === '')
            return false;

        return isNumber(Number(val));
    };


    var fromNumeric = util.fromNumeric = function(val, defaultVal) {
        if (arguments.length <= 1)
            defaultVal = null;

        return isNumeric(val) ? Number(val) : defaultVal;
    };


    /** Проверяет является ли значение `val` непустой сторкой (при проверке пробелы отсекаются) */
    var isNonEmptyString = util.isNonEmptyString = function(val) {
        return typeof val === 'string' && val.trim() !== '';
    };


    var addBemModifier = util.addBemModifier = function(cls, modifier) {
        ensure.nonEmptyString(cls, modifier);
        ensure(hasNoWhitespaces(cls), 'String with no whitespaces expected');
        ensure(hasNoWhitespaces(modifier), 'String with no whitespaces expected');

        return cls + ' ' + cls + '--' + modifier;
    };


    var hasNoWhitespaces = util.hasNoWhitespaces = function(s, strict) {
        ensure.string(s);
        ensure.maybe.boolean(strict);

        if (!strict) s = s.trim();
        return s.split(/\s/).length === 1;
    };


    var isNonEmptyArray = util.isNonEmptyArray = function(val) {
        return Array.isArray(val) && val.length !== 0;
    };


    var isJqElement = util.isJqElement = function(val) {
        return val instanceof jQuery && val.length === 1; // Only one expected
    };


    var isNonEmptyJqCollection = util.isNonEmptyJqCollection = function(val) {
        return val instanceof jQuery && val.length !== 0;
    };


    var flat2tree = util.flat2tree = function(arr, idKey, parentIdKey, childrenKey) {
        var groups = _.groupBy(arr, function(item) { return item[parentIdKey] == null ? '__root' : item[parentIdKey] });
        arr.forEach(function(item) { delete item[parentIdKey] }); // No need
        var refs = _.keyBy(arr, idKey);

        _.forEach(groups, function(children, groupId) {
            if (groupId !== '__root')
                _.set(refs, [groupId, childrenKey], children);
        });

        return groups['__root'];
    };


    var getPath = util.getPath = function(obj, path) {
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
    }


    var setPath = util.setPath = function(obj, path, data) {
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
    }


    var lorem = util.lorem = function(sentenceCount, wordCount) {
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


    var sortTree = util.sortTree = function(items, sortKey, childrenKey) {
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


    /** Удостоверяется, что условие `cond === true`, иначе выбрасывает ошибку с сообщением `errMsg` */
    var ensure = util.ensure = function(cond, errMsg) {
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
    _ensurify('integer', Number.isInteger, 'Integer');
    _ensurify('positiveInteger', isPositiveInteger, 'Positive integer');
    _ensurify('nonNegativeInteger', isNonNegativeInteger, 'Non-negative integer');
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
        ensure(typeof str === 'string' && typeof sep === 'string', 'String expected');
        return [str.substr(0, str.indexOf(sep)), str.substr(str.indexOf(sep) + 1)];
    };


    var handleRejection = util.handleRejection = function(msg) {
        ensure.nonEmptyString(msg);

        return function(err) {
            toastr.error(err.message, msg);
            console.error(err);
        };
    };


    var responseToError = util.responseToError = function(res) {
        console.warn('Deprecated?');

        var msg = res.status + ' ' + res.statusText;

        if (isNonEmptyString(res.responseText))
            msg += '\n\n' + res.responseText.split('\n', 5).join('\n');

        throw new Error(msg);
    };


    var $confirm = $('<div>', { attr: { title: 'Подтверждение' }, css: { lineHeight: '1.4em' } });

    $confirm.dialog({
        modal: true,
        resizable: false,
        draggable: false,
        autoOpen: false,
    });

    var confirm = util.confirm = function(msg, onOk) {
        ensure.nonEmptyString(msg);
        ensure.function(onOk);

        $confirm.text(msg);

        var buttons = [];

        buttons.push({ text: 'OK', click: function() { $confirm.dialog('close'); onOk() } });
        buttons.push({ text: 'Отмена', click: function() { $confirm.dialog('close') } });

        if (isNonEmptyArray(buttons))
            $confirm.dialog('option', 'buttons', buttons);

        $confirm.dialog('open');
    };


    var popup = util.popup = function(title, $popup, args) {
        ensure.nonEmptyString(title);
        ensure.jqElement($popup);
        ensure.maybe.plainObject(args);

        if (!_.isPlainObject(args))
            args = {};

        ensure.maybe.function(args.open, args.ok, args.close);

        var options = {
            modal: true,
            resizable: false,
            draggable: false,
            title: title,
            width: 'auto',
        };

        if (typeof args.open === 'function')
            options.open = args.open;

        if (typeof args.close === 'function')
            options.close = function() { args.close(); $popup.dialog('destroy') };
        else
            options.close = function() { $popup.dialog('destroy') };

        var buttons = [];

        if (typeof args.ok === 'function')
            buttons.push({ text: 'OK', click: args.ok, attr: { 'js-ok-btn': '' } });

        buttons.push({ text: 'Закрыть', click: function() { $popup.dialog('close') } });

        if (isNonEmptyArray(buttons))
            options.buttons = buttons;

        $popup.dialog(options);
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
        hide: 'fade',
    });

    var blockUi = util.blockUi = function() { $spinner.dialog('open') };
    var unblockUi = util.unblockUi = function() { $spinner.dialog('close') };


    var initTabWidget = util.initTabWidget = function($tabWidget) {
        ensure.jqElement($tabWidget);
        $tabWidget.addClass('tab-widget');
        var $tabBar = $('<ul>', { class: 'tab-widget__tab-bar', attr: { 'js-tab-bar': '' } });

        $tabBar.on('click', '[js-tab-close-btn]', function() {
            var $tabBtn = ensure.jqElement($(this).closest('[js-tab-btn]'));
            removeTab($tabWidget, $tabBtn);
        });

        $tabBar.on('mouseenter', '[js-tab-close-btn]', function() { $(this).switchClass('ui-icon-close', 'ui-icon-circle-close', 0) });
        $tabBar.on('mouseleave', '[js-tab-close-btn]', function() { $(this).switchClass('ui-icon-circle-close', 'ui-icon-close', 0) });

        $tabWidget.html([
            $tabBar,
            $('<div>', { class: 'tab-widget__tab-outlet', attr: { 'js-tab-outlet': '' } }),
        ]);

        $tabWidget.tabs({ event: 'mousedown' });
        $tabBar.sortable({ axis: 'x', stop: function() { $tabWidget.tabs('refresh') } });
    };


    var createTab = util.createTab = function($tabWidget, title, shouldActivate) {
        ensure.jqElement($tabWidget);
        ensure.maybe.nonEmptyString(title);
        ensure.maybe.boolean(shouldActivate);

        var $tabBtn = $('<li>', {
            attr: { 'js-tab-btn': '' },

            html: $('<a>', {
                class: 'tab-widget__tab-btn-anchor',
                attr: { 'js-tab-btn-anchor': '' },

                html: [
                    $('<span>', { attr: { 'js-tab-title': '' } }),
                    $('<span>', { class: 'ui-icon ui-icon-close tab-widget__tab-close-btn', attr: { 'js-tab-close-btn': '' } }),
                ],
            }),
        });

        $tabBtn.hide();
        var $tabBtnAnchor = ensure.jqElement($tabBtn.find('[js-tab-btn-anchor]'));
        var tabId = util.randomIdent();
        $tabBtnAnchor.attr('href', '#' + tabId);

        var $tabTitle = ensure.jqElement($tabBtnAnchor.find('[js-tab-title]'));
        $tabTitle.text(title);
        $tabTitle.on('mousedown', function($evt) { $evt.which === 2 && $evt.stopPropagation() }); // Prevent middle-click tab activation

        var $tabCloseBtn = ensure.jqElement($tabBtnAnchor.find('[js-tab-close-btn]'));
        $tabCloseBtn.on('mousedown', function($evt) { $evt.stopPropagation() }); // Prevent tab activation

        var $tabBar = ensure.jqElement($tabWidget.find('[js-tab-bar]'));
        $tabBar.append($tabBtn);
        $tabBtn.fadeIn();

        var $tabOutlet = ensure.jqElement($tabWidget.find('[js-tab-outlet]'));
        var $tabView = $('<div>', { class: 'tab-widget__tab-view', attr: { id: tabId }, 'js-tab-view': '' });
        $tabView.hide();
        $tabOutlet.append($tabView);
        $tabView.fadeIn();

        $tabWidget.tabs('refresh');

        if (shouldActivate)
            $tabWidget.tabs('option', 'active', $tabBtn.index());

        return $tabView;
    };


    var removeTab = util.removeTab = function($tabWidget, $tabBtn) {
        ensure.jqElement($tabWidget, $tabBtn);

        var tabActive = $tabWidget.tabs('option', 'active') === $tabBtn.index();
        var tabCount = $tabWidget.find('[js-tab-btn]').length;
        var needToActivateNextTab = tabActive && tabCount !== 0;

        if (needToActivateNextTab)
            var nextActiveTabIndex = $tabBtn.index() - 1 < 0 ? 0 : $tabBtn.index() - 1;

        var tabViewSelector = ensure.nonEmptyString($tabBtn.find('[js-tab-btn-anchor]').attr('href'));
        var $tabView = ensure.jqElement($tabWidget.find(tabViewSelector));

        $.when($tabBtn.fadeOut(), $tabView.fadeOut()).then(function() {
            $tabBtn.remove();
            $tabView.remove();

            $tabWidget.tabs('refresh');

            if (needToActivateNextTab)
                $tabWidget.tabs('option', 'active', nextActiveTabIndex);
        });
    };


    var getActiveTabBtn = util.getActiveTabBtn = function($tabWidget) {
        ensure.jqElement($tabWidget);
        var $tabBtns = ensure.nonEmptyJqCollection($tabWidget.find('[js-tab-btn]'));
        var activeTabIndex = ensure.nonNegativeInteger($tabWidget.tabs('option', 'active'));
        return ensure.jqElement($tabBtns.eq(activeTabIndex));
    };
}());

(function() {
    'use strict';

    var jqUtil = window.jqUtil = {};
    jqUtil._version = 'dev';


    var ensure = util.ensure;


    var $confirm = $('<div>', { attr: { title: 'Подтверждение' }, css: { lineHeight: '1.4em' } });

    $confirm.dialog({
        modal: true,
        resizable: false,
        draggable: false,
        autoOpen: false,
    });

    var confirm = jqUtil.confirm = function(msg, onOk) {
        ensure.nonEmptyString(msg);
        ensure.function(onOk);

        $confirm.text(msg);

        var buttons = [];

        buttons.push({ text: 'OK', click: function() { $confirm.dialog('close'); onOk() } });
        buttons.push({ text: 'Отмена', click: function() { $confirm.dialog('close') } });

        if (util.isNonEmptyArray(buttons))
            $confirm.dialog('option', 'buttons', buttons);

        $confirm.dialog('open');
    };


    var popup = jqUtil.popup = function(title, $popup, callbacks, extraOptions) {
        ensure.maybe.nonEmptyString(title);
        ensure.jqElement($popup);
        ensure.maybe.plainObject(callbacks, extraOptions);

        if (!_.isPlainObject(callbacks)) callbacks = {};

        ensure.maybe.function(callbacks.open, callbacks.ok, callbacks.close);

        var options = {
            modal: true,
            resizable: false,
            draggable: false,
            title: title,
            width: 'auto',
        };

        if (typeof callbacks.open === 'function') options.open = callbacks.open;

        if (typeof callbacks.close === 'function') options.close = function() { callbacks.close(); $popup.dialog('destroy') };
        else options.close = function() { $popup.dialog('destroy') };

        var buttons = [];
        if (typeof callbacks.ok === 'function') buttons.push({ text: 'OK', click: callbacks.ok, attr: { 'js-ok-btn': '' } });
        buttons.push({ text: 'Закрыть', click: function() { $popup.dialog('close') } });
        if (util.isNonEmptyArray(buttons)) options.buttons = buttons;

        $popup.dialog(Object.assign(options, extraOptions));
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

    var blockUi = jqUtil.blockUi = function() { $spinner.dialog('open') };
    var unblockUi = jqUtil.unblockUi = function() { $spinner.dialog('close') };


    var initTabWidget = jqUtil.initTabWidget = function($tabWidget) {
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


    var createTab = jqUtil.createTab = function($tabWidget, title, shouldActivate) {
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


    var removeTab = jqUtil.removeTab = function($tabWidget, $tabBtn) {
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


    var getActiveTabBtn = jqUtil.getActiveTabBtn = function($tabWidget) {
        ensure.jqElement($tabWidget);
        var $tabBtns = ensure.nonEmptyJqCollection($tabWidget.find('[js-tab-btn]'));
        var activeTabIndex = ensure.nonNegativeInteger($tabWidget.tabs('option', 'active'));
        return ensure.jqElement($tabBtns.eq(activeTabIndex));
    };
}());

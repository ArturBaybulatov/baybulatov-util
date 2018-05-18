(function() {
    'use strict';

    var kendoUtil = window.kendoUtil = {};

    var ensure = util.ensure;


    var popup = kendoUtil.popup = function($popup, extraOptions, callbacks) {
        ensure.jqElement($popup);
        ensure.maybe.plainObject(extraOptions, callbacks);

        if (!_.isPlainObject(callbacks)) callbacks = {}; // To prevent reference errors

        var options = {
            visible: false,
            content: $popup,
            minWidth: 400,
            maxWidth: 800,
            maxHeight: 600,
            actions: [],
        };

        var kDialog = $('<div>').kendoDialog(options).data('kendoDialog');
        var destroy = function() { kDialog.destroy(); $('.k-overlay').remove() };

        if (typeof callbacks.ok === 'function') {
            options.actions.push({
                text: 'OK',
                primary: true,
                action: function() { callbacks.ok.call(kDialog, destroy); return false },
            });
        }

        options.actions.push({ text: 'Close' });

        if (typeof callbacks.open === 'function') options.open = callbacks.open.bind(kDialog, destroy);

        options.close = function() {
            if (typeof callbacks.close === 'function') callbacks.close.call(kDialog);
            this.destroy();
        };

        kDialog.setOptions(Object.assign(options, extraOptions));
        kDialog.open();
    };


    var $spinner = $('<div>', { html: $('<div>', { class: 'spinner', attr: { 'js-spinner': '' } }) });

    var kSpinner = $spinner.kendoDialog({
        visible: false,
        closable: false,
        title: '',
        minWidth: 70,
        minHeight: 70,
        actions: [],
    }).data('kendoDialog');

    kSpinner.wrapper.find('.k-dialog-titlebar').remove();

    kSpinner.wrapper.find(':not([js-spinner])').addBack().css({
        margin: 0,
        padding: 0,
        backgroundColor: 'transparent',
        border: 'none',
        overflow: 'visible',
    });

    var blockUi = kendoUtil.blockUi = function() { kSpinner.open() };
    var unblockUi = kendoUtil.unblockUi = function() { kSpinner.close() };
}());

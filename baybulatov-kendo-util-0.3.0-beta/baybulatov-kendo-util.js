(function() {
    'use strict';

    var kendoUtil = window.kendoUtil = {};

    var ensure = util.ensure;


    var popup = kendoUtil.popup = function(extraOptions, otherOpts) {
        ensure.maybe.plainObject(extraOptions, otherOpts);

        if (!_.isPlainObject(otherOpts)) otherOpts = {}; // To prevent reference errors

        var options = {
            visible: false,
            minWidth: 400,
            maxWidth: 800,
            maxHeight: 600,
            actions: [{ text: util.isNonEmptyString(otherOpts.closeBtnText) ? otherOpts.closeBtnText : 'Close' }],
        };

        var kPopup = $('<div>').kendoDialog(options).data('kendoDialog');
        kPopup.__destroy = function() { kPopup.destroy(); $('.k-overlay').remove() };

        // TODO: Get rid of the second argument (`kDialog.__destroy`) in the next version:
        if (typeof otherOpts.open === 'function') options.open = otherOpts.open.bind(kPopup, kPopup.__destroy);

        if (typeof otherOpts.ok === 'function') {
            options.actions.unshift({
                text: util.isNonEmptyString(otherOpts.okBtnText) ? otherOpts.okBtnText : 'OK',
                primary: true,
                action: function() { otherOpts.ok.call(kPopup, kPopup.__destroy); return false },
            });
        }

        options.close = function() {
            if (typeof otherOpts.close === 'function') otherOpts.close.call(kPopup);
            this.destroy();
        };

        kPopup.setOptions(Object.assign(options, extraOptions));

        if (options.closable !== false) $(document).on('click', '.k-overlay', function() { kPopup.close() });

        return kPopup;
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

(function() {
    'use strict';

    var kendoUtil = window.kendoUtil = {};

    var ensure = util.ensure;


    var popup_ = kendoUtil.popup_ = function(extraOptions, otherOpts) {
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


    var popup = kendoUtil.popup = function(extraOptions) {
        ensure.maybe.plainObject(extraOptions);


        if (!_.isPlainObject(extraOptions)) extraOptions = {}; // To prevent reference errors


        const maxWidth = util.isPositiveInteger(extraOptions.maxWidth) ? extraOptions.maxWidth : 400;
        const maxHeight = util.isPositiveInteger(extraOptions.maxHeight) ? extraOptions.maxHeight : 300;


        const kPopup = $('<div class="f-grow line-height" style="padding: 0"></div>').kendoDialog(Object.assign({
            visible: false,
        }, extraOptions)).getKendoDialog();


        kPopup.__destroy = function() { kPopup.destroy(); $('.k-overlay').remove() };


        const popupId = util.randomIdent();

        kPopup.bind('open', function() { this.wrapper.addClass('flex f-col') });
        kPopup.bind('close', function() { this.destroy(); $(window).off('resize.' + popupId) });


        if (kPopup.options.closable !== false) $(document).on('click', '.k-overlay', function() { kPopup.close() });


        adjustPopupSize();

        $(window).on('resize.' + popupId, adjustPopupSize);


        return kPopup;


        function adjustPopupSize() {
            const intervId = setInterval(function() {
                const availableWidth = $(window).width() - 40;

                kPopup.element.css('width', availableWidth < maxWidth ? availableWidth : maxWidth);


                const availableHeight = $(window).height() - 160;

                kPopup.element.css('height', availableHeight < maxHeight ? availableHeight : maxHeight);


                kPopup.center();
            }, 100);

            setTimeout(function() { clearInterval(intervId) }, 500);
        }
    };


    var kSpinner = $('<div>').kendoDialog({
        content: '<div class="spinner" js-spinner></div>',
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
        boxShadow: 'none',
    });


    let spinnerCount = 0;

    var blockUi = kendoUtil.blockUi = function() {
        if (spinnerCount === 0) kSpinner.open();
        ++spinnerCount;
    };

    var unblockUi = kendoUtil.unblockUi = function() {
        if (spinnerCount === 1) kSpinner.close();
        --spinnerCount;
    };
}());

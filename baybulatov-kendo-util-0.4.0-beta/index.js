import * as util from '../baybulatov-util-js-0.7.0-beta';


const ensure = util.ensure;


export const popup = function(extraOptions) {
    ensure.maybe.plainObject(extraOptions);


    if (!_.isPlainObject(extraOptions)) extraOptions = {}; // To prevent reference errors


    const maxWidth = util.isPositiveInteger(extraOptions.maxWidth) ? extraOptions.maxWidth : 400;
    const maxHeight = util.isPositiveInteger(extraOptions.maxHeight) ? extraOptions.maxHeight : 300;


    const kPopup = $(`<div class="f-grow line-height" style="padding: 0"></div>`)
        .kendoDialog(Object.assign({ visible: false }, extraOptions))
        .getKendoDialog();


    kPopup.__destroy = function() { kPopup.destroy(); $('.k-overlay').remove() };


    const popupId = util.randomIdent();

    kPopup.bind('open', function() { this.wrapper.addClass('flex f-col') });
    kPopup.bind('close', function() { this.destroy(); $(window).off(`resize.${ popupId }`) });


    if (kPopup.options.closable !== false) $(document).on('click', '.k-overlay', () => kPopup.close());


    adjustPopupSize();

    $(window).on(`resize.${ popupId }`, adjustPopupSize);


    return kPopup;


    function adjustPopupSize() {
        const intervId = setInterval(function() {
            const availableWidth = $(window).width() - 40;

            kPopup.element.css('width', availableWidth < maxWidth ? availableWidth : maxWidth);


            const availableHeight = $(window).height() - 160;

            kPopup.element.css('height', availableHeight < maxHeight ? availableHeight : maxHeight);


            kPopup.center();
        }, 100);

        setTimeout(() => clearInterval(intervId), 500);
    }
};


const kSpinner = $('<div>').kendoDialog({
    content: `<div class="spinner" js-spinner></div>`,
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

export const blockUi = function() {
    if (spinnerCount === 0) kSpinner.open();
    ++spinnerCount;
};

export const unblockUi = function() {
    if (spinnerCount === 1) kSpinner.close();
    --spinnerCount;
};

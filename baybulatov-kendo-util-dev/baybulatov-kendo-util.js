(function() {
    'use strict';

    var kendoUtil = window.kendoUtil = {};
    kendoUtil._version = 'dev';


    var ensure = util.ensure;


    var popup = kendoUtil.popup = function(title, $popup, callbacks, extraOptions) {
        ensure.nonEmptyString(title);
        ensure.jqElement($popup);
        ensure.maybe.plainObject(callbacks, extraOptions);

        if (!_.isPlainObject(callbacks))
            callbacks = {};

        ensure.maybe.function(callbacks.open, callbacks.ok, callbacks.close);

        var options = {
            visible: true,
            title: title,
            content: $popup,
            minWidth: 400,
            maxWidth: 800,
            maxHeight: 600,
        };

        if (typeof callbacks.open === 'function')
            options.open = callbacks.open;

        options.close = function() {
            if (typeof callbacks.close === 'function')
                callbacks.close();

            this.destroy();
        };

        options.actions = [
            {
                text: 'OK',
                primary: true,

                action: function(evt) {
                    var kDialog = evt.sender;

                    if (typeof callbacks.ok === 'function') {
                        callbacks.ok.call(kDialog);
                        return false;
                    } else {
                        g.kDialog = kDialog;
                        //kDialog.destroy();
                        return false; // Tmp
                    }
                },
            },

            { text: 'Close' },
        ];

        return $('<div>').kendoDialog(Object.assign(options, extraOptions)).data('kendoDialog');
    };
}());

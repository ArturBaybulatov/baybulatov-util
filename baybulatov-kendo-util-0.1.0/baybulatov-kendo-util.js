(function() {
    'use strict';

    var kendoUtil = window.kendoUtil = {};
    kendoUtil._version = '0.1.0';


    var ensure = util.ensure;


    var popup = kendoUtil.popup = function(title, $popup, args) {
        ensure.nonEmptyString(title);
        ensure.jqElement($popup);
        ensure.maybe.plainObject(args);

        if (!_.isPlainObject(args))
            args = {};

        ensure.maybe.function(args.open, args.ok, args.close);

        var options = {
            title: title,
            content: $popup,
            minWidth: 400,
        };

        if (typeof args.open === 'function')
            options.open = args.open;

        options.close = function() {
            if (typeof args.close === 'function')
                args.close();

            this.destroy();
        };

        var actions = [];

        actions.push({
            text: 'OK',
            primary: true,

            action: function() {
                if (typeof args.ok === 'function')
                    args.ok();

                return false;
            },
        });

        actions.push({ text: 'Close' });

        if (util.isNonEmptyArray(actions))
            options.actions = actions;

        $('<div>').kendoDialog(options).data('kendoDialog').open();
    };
}());

'use strict';

const Schwifty = require('schwifty');

exports.Model = class extends Schwifty.Model {

    static field(name) {

        return this.getJoiSchema()
            .extract(name)
            .optional()
            .prefs({ noDefaults: true });
    }

};

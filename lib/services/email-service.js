'use strict';

const Schmervice = require('schmervice');
const Util = require('util');

const Sendemail = Util.promisify(require('sendemail').email);

const internals = {};

// expects data to be template variables set as desired for placement in templates
module.exports = class EmailService extends Schmervice.Service {

    // recipient is expected to be a Users instance
    // all data is expected to be formatted
    send(context, recipient, data) {

        const envelope = {
            email: recipient.email,
            subject: this.configure(context),
            templateVars: data
        };

        return Sendemail(context, envelope);
    }

    configure(context) {

        // $lab:coverage:off$
        switch (context) {
            case 'password-reset':
                return 'User Password Reset';
                break;
            default:
                return 'Default email case';
        }
        // $lab:coverage:on$
    }
};

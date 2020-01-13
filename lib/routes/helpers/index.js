'use strict';

const Toys = require('toys');

exports.withDefaults = Toys.withRouteDefaults({ //new Confidence.Store({
    options: {
        cors: true,//TODO conditionalize on env.  Confidence?
        validate: {
            failAction: (request, h, err) => {

                throw err;
            }
        }
    }
});

// This is gonna run a LOT, so use reacher instead of Hoek version.
exports.currentUserId = Toys.reacher('auth.credentials.userId', { default: null });

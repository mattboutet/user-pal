'use strict';

const Joi = require('@hapi/joi');

const Helpers = require('../helpers');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'POST',
        path: '/users/request-reset',
        options: {
            description: 'Request password reset for a user',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                })
            },
            auth: false
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            const { email } = request.payload;

            const requestReset = async (trx) => {

                return await userService.requestPasswordReset(email, trx);
            };

            await h.context.transaction(requestReset);

            return h.response().code(200);
        }
    });
};

'use strict';

const Joi = require('@hapi/joi');

const Helpers = require('../helpers');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'GET',
        path: '/users/authenticated',
        options: {
            description: 'Check if user token is valid',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string()
                        .description('JWT')
                }).unknown()
            },
            auth: {
                strategy: 'api-user-jwt'
            }
        },
        handler: (request, h) => {

            return h.response().code(200);
        }
    });
};

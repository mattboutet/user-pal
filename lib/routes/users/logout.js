'use strict';

const Joi = require('@hapi/joi');
const Helpers = require('../helpers');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'POST',
        path: '/logout',
        options: {
            description: 'Log user out',
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
        handler: async (request, h) => {

            const { tokenService } = request.services();
            const { jti } = request.auth.credentials;

            const logout = async (trx) => {

                return await tokenService.delete(jti, trx);
            };

            await h.context.transaction(logout);

            return h.response().code(200);
        }
    });
};

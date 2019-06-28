'use strict';

const Joi = require('@hapi/joi');
const Helpers = require('../helpers');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'POST',
        path: '/logout-all',
        options: {
            description: 'Log user out of all current sessions',
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
            const currentUserId = Helpers.currentUserId(request);

            const logoutAll = async (trx) => {

                return await tokenService.deleteAll(currentUserId, trx);
            };

            await h.context.transaction(logoutAll);

            return h.response().code(200);
        }
    });
};

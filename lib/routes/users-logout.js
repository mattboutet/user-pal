'use strict';

const Joi = require('joi');

const internals = {};

module.exports = (server, options) => {

    return {
        method: 'POST',
        path: '/logout',
        config: {
            description: 'Log user out',
            tags: ['api', 'private'],
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

            const Tokens = request.models().Tokens;

            const { jti } = request.auth.credentials;
            await Tokens.query().deleteById(jti);

            return h.response().code(200);
        }
    };
};

'use strict';

const Joi = require('joi');
const Boom = require('boom');

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
        handler: async (request) => {

            const Tokens = request.models().Tokens;

            const { jti } = request.auth.credentials;
            const rowsDeleted = await Tokens.query().deleteById(jti);

            if (rowsDeleted === 1) {
                return 'Logout Successful';
            }

            return Boom.notFound('Unable to log out');
        }
    };
};

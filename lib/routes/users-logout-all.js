'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

module.exports = (server, options) => {

    return {
        method: 'POST',
        path: '/logout-all',
        config: {
            description: 'Log user out of all current sessions',
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

            const { userId } = request.auth.credentials;
            const rowsDeleted = await Tokens.query().where({ userId }).delete();

            //It's an authenticated route, so there has to be at least 1 token.
            if (rowsDeleted > 0 ) {
                return 'Logout Successful';
            }

            return Boom.notFound('Unable to log out all');
        }
    };
};

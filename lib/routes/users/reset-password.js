'use strict';

const Joi = require('@hapi/joi');

const Helpers = require('../helpers');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'POST',
        path: '/users/reset-password',
        options: {
            description: 'Reset password for a user',
            tags: ['api'],
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                    resetToken: Joi.string().required(),
                    newPassword: Joi.string().required()
                }
            },
            auth: false
        },
        handler: async (request, h) => {

            const { userService, tokenService } = request.services();

            const resetPassword = async (trx) => {

                const user = await userService.resetPassword({ ...request.payload }, trx);
                const token = await tokenService.createToken(user,trx);

                return { user, token };
            };

            return await h.context.transaction(resetPassword);
        }
    });
};

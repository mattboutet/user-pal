'use strict';

const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

const Helpers = require('../helpers');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'POST',
        path: '/users/change-password',
        options: {
            description: 'Change password of logged-in user',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string()
                        .description('JWT')
                }).unknown(),
                payload: {
                    password: Joi.string().required(),
                    newPassword: Joi.string().required()
                }
            },
            auth: {
                strategy: 'api-user-jwt'
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            const currentUserId = Helpers.currentUserId(request);
            const { password, newPassword } = request.payload;

            if (password === newPassword){
                return Boom.badRequest('New password must be different from old password');
            }

            const changePassword = async (trx) => {

                return await userService.changePassword(currentUserId, { password, newPassword }, trx);
            };


            return await h.context.transaction(changePassword);

            // return h.response().code(200);
        }
    });
};

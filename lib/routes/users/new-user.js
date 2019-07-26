'use strict';

const Joi = require('@hapi/joi');

const Helpers = require('../helpers');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'POST',
        path: '/users',
        options: {
            description: 'Register new user',
            tags: ['api'],
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    role: Joi.string().required()
                }
            },
            auth: false
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            const userInfo = request.payload;

            const createUser = async (trx) => {

                return await userService.create(userInfo, trx);
            };

            const id = await h.context.transaction(createUser);

            return { id };
        }
    });
};

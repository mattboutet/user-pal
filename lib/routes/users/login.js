'use strict';

const Joi = require('@hapi/joi');

const Helpers = require('../helpers');
const Users = require('../../models/Users');

module.exports = (server, options) => {

    return Helpers.withDefaults({
        method: 'POST',
        path: '/login',
        options: {
            description: 'Log in',
            tags: ['api'],
            validate: {
                payload: {
                    email: Users.field('email').required(),
                    password: Joi.string().required()
                }
            },
            auth: false
        },
        handler: async (request, h) => {

            const { email, password } = request.payload;
            const { userService, tokenService } = request.services();

            const login = async (trx) => {

                const user = await userService.login({ email, password }, trx);
                const token = await tokenService.createToken(user, trx);

                return { user, token };
            };

            return await h.context.transaction(login);
        }
    });
};

'use strict';

const Boom = require('boom');
const Joi = require('joi');
const SecurePassword = require('secure-password');
const { wrapError: WrapError, UniqueViolationError } = require('db-errors');

//new instance of SecurePassword using the default config
const Pwd = new SecurePassword();

const internals = {};

module.exports = (server, options) => {

    return {
        method: 'POST',
        path: '/users',
        config: {
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
        handler: async (request) => {

            const Users = request.models().Users;
            const payload = request.payload;

            const userPassword = Buffer.from(payload.password);
            const hash = Pwd.hashSync(userPassword);

            try {
                const user = await Users.query()
                    .insertAndFetch({
                        email: payload.email,
                        password: hash.toString('utf8'),
                        firstName: payload.firstName,
                        lastName: payload.lastName,
                        role: payload.role
                    });
                return user;
            }
            catch (error) {

                const dbErr = WrapError(error);
                if (dbErr instanceof UniqueViolationError) {
                    return Boom.badRequest('Duplicate email');
                }

                return error;
            }
        }
    };
};

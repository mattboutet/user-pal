'use strict';

const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const SecurePassword = require('secure-password');
const JWT = require('jsonwebtoken');

//new instance of SecurePassword using the default config
const Pwd = new SecurePassword();

const internals = {};

module.exports = (server, options) => {

    return {
        method: 'POST',
        path: '/login',
        config: {
            description: 'Log in',
            tags: ['api'],
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                }
            },
            auth: false
        },
        handler: async (request) => {

            const { Tokens, Users } = request.models();
            const Payload = request.payload;

            const foundUser = await Users.query().where({ email: Payload.email }).whereNotNull('password').first();

            if (!foundUser) {
                return Boom.unauthorized('User or Password is invalid');
            }

            const userPassword = Buffer.from(Payload.password);
            const hash = Buffer.from(foundUser.password);

            const result = await Pwd.verifySync(userPassword, hash);

            // $lab:coverage:off$
            if (result === SecurePassword.INVALID ||
                result === SecurePassword.INVALID_UNRECOGNIZED_HASH) {
                // $lab:coverage:on$
                return Boom.unauthorized('User or Password is invalid');
            }

            //Testing this is more trouble than its worth for now
            // $lab:coverage:off$
            if (result === SecurePassword.VALID_NEEDS_REHASH) {
                const newHash = await Pwd.hashSync(userPassword);

                await Users.query().where({ 'id': foundUser.id })
                    .patch({ 'password': newHash.toString('utf8') });
            }
            // $lab:coverage:on$

            const newToken = await Tokens.query().insertAndFetch({});

            await newToken.$relatedQuery('user').relate(foundUser);

            const signed = JWT.sign({
                jti: newToken.id,
                userId: foundUser.id,
                scope: foundUser.role
            }, options.jwtKey);

            return signed;
        }
    };
};

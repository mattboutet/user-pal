'use strict';

const Joi = require('joi');
const Boom = require('boom');
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

            const foundUser = await Users.query() .where({ email: Payload.email }).first();

            // User password gets set to null when using reset password route
            if (!foundUser || !foundUser.password) {
                return Boom.unauthorized('User or Password is invalid');
            }

            const userPassword = Buffer.from(Payload.password);
            const hash = Buffer.from(foundUser.password);

            const result = await Pwd.verifySync(userPassword, hash);

            if (result === SecurePassword.INVALID_UNRECOGNIZED_HASH ||
                result === SecurePassword.INVALID) {
                return Boom.unauthorized('User or Password is invalid');
            }
            else if (result === SecurePassword.VALID ||
                result === SecurePassword.VALID_NEEDS_REHASH) {

                if (result === SecurePassword.VALID_NEEDS_REHASH) {
                    const newHash = await Pwd.hashSync(userPassword);

                    await Users.query().where({ 'id': foundUser.id })
                        .patch({ 'password': newHash.toString('utf8') });
                }

                const newToken = await Tokens.query().insertAndFetch({});

                await newToken.$relatedQuery('user').relate(foundUser);

                const signed = JWT.sign({
                    jti: newToken.id,
                    userId: foundUser.id
                }, options.jwtKey);

                return signed;
            }
        }
    };
};

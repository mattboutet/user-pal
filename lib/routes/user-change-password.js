'use strict';

const Joi = require('joi');
const SecurePassword = require('secure-password');
const Boom = require('boom');

//new instance of SecurePassword using the default config
const Pwd = new SecurePassword();

const internals = {};

module.exports = (server, options) => {

    return {
        method: 'POST',
        path: '/users/change-password',
        config: {
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

            const Users = request.models().Users;
            const userId = request.auth.credentials.userId;
            const Payload = request.payload;

            if (Payload.password === Payload.newPassword){
                return Boom.badRequest('New password can not be the same as old password');
            }

            const foundUser = await Users.query().findById(userId);

            const userPassword = Buffer.from(Payload.password);
            const hash = Buffer.from(foundUser.password);

            const result = Pwd.verifySync(userPassword, hash);

            if (result === SecurePassword.INVALID_UNRECOGNIZED_HASH ||
                result === SecurePassword.INVALID) {

                return Boom.badRequest('User or Password is invalid');
            }

            const newPassword = Buffer.from(Payload.newPassword);

            const newHash = Pwd.hashSync(newPassword);

            await Users.query()
                .patch({ 'password': newHash.toString('utf8') })
                .where({ id: foundUser.id });

            return h.response().code(200);
        }
    };
};

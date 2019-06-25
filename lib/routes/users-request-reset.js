'use strict';

const Joi = require('@hapi/joi');
const SecurePassword = require('secure-password');
const Uuid = require('uuid');
const Boom = require('@hapi/boom');

//new instance of SecurePassword using the default config
const Pwd = new SecurePassword();

const internals = {};

module.exports = (server, options) => {

    return {
        method: 'POST',
        path: '/users/request-reset',
        config: {
            description: 'Request password reset for a user',
            tags: ['api'],
            validate: {
                payload: {
                    email: Joi.string().email().required()
                }
            },
            auth: false
        },
        handler: async (request) => {

            const Users = request.models().Users;
            const { emailService } = request.services();
            const Payload = request.payload;

            const rawResetToken = Buffer.from(Uuid({ rng: Uuid.nodeRNG }));

            const hash = Pwd.hashSync(rawResetToken);

            const patchedUser = await Users.query()
                .patch({ 'password': null, resetToken: hash.toString('utf8') })
                .where({ 'email': Payload.email })
                .first()
                .returning('*');

            if (patchedUser) {

                const resetUrl = options.siteUrl + '/password-reset/' + rawResetToken;

                await emailService.send('password-reset', patchedUser, { resetUrl });
                return 'Check your email for a reset link';
            }

            return Boom.unauthorized('Unable to complete password reset for that user');
        }
    };
};

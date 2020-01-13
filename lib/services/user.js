'use strict';

const Boom = require('@hapi/boom');
const Schmervice = require('schmervice');
const SecurePassword = require('secure-password');
const Util = require('util');
const Uuid = require('uuid');

module.exports = class UserService extends Schmervice.Service {

    constructor(...args) {

        super(...args);

        const pwd = new SecurePassword();
        // sync versions of these were erroring on missing opslimit, async works fine though?
        this.pwd = {
            hash: Util.promisify(pwd.hash.bind(pwd)),
            verify: Util.promisify(pwd.verify.bind(pwd))
        };
    }

    // These aren't hit yet, but will be needed in any
    // real app built on top, so just ignore for testing
    // $lab:coverage:off$
    async findById(id, trx) {

        const { Users } = this.server.models();

        return await Users.query(trx).throwIfNotFound().findById(id);
    }

    async findByEmail(email, trx) {

        const { Users } = this.server.models();

        return await Users.query(trx).throwIfNotFound().first().where({ email });
    }

    async update(id, { password, ...userInfo }, trx) {

        const { Users } = this.server.models();

        if (Object.keys(userInfo).length > 0) {
            await Users.query(trx).throwIfNotFound().where({ id }).patch(userInfo);
        }

        if (password) {
            await this.setPassword(id, password, trx);
        }

        return id;
    }
    // $lab:coverage:on$

    async create(userInfo, trx) {

        const { Users } = this.server.models();
        const { password } = userInfo;

        delete userInfo.password;
        const { id } = await Users.query(trx).insert(userInfo);

        await this.setPassword(id, password, trx);

        return id;
    }

    async login({ email, password }, trx) {

        const { Users } = this.server.models();

        const user = await Users.query(trx).first().where({ email }).whereNotNull('password');

        if (!user) {
            //don't leak info about existence of users.
            throw Boom.unauthorized('Invalid email or password');
        }

        const passwordCheck = await this.pwd.verify(Buffer.from(password), user.password);

        // rehash is hard/contrived to generate, skip for testing.
        // $lab:coverage:off$
        if (passwordCheck === SecurePassword.VALID_NEEDS_REHASH) {
            await this.setPassword(user.id, password, trx);
        }
        // $lab:coverage:on$
        else if (passwordCheck !== SecurePassword.VALID) {
            throw Boom.unauthorized('Invalid email or password');
        }

        return user;
    }

    async changePassword(id, { password, newPassword }, trx) {

        const { Users } = this.server.models();

        const foundUser = await Users.query(trx).throwIfNotFound().findById(id);

        const result = await this.pwd.verify(Buffer.from(password), foundUser.password);

        //Unrecognized hash is a pain/contrived to generate, don't bother
        // $lab:coverage:off$
        if (result === SecurePassword.INVALID ||
            result === SecurePassword.INVALID_UNRECOGNIZED_HASH) {
            // $lab:coverage:on$

            throw Boom.unauthorized('Invalid Password');
        }

        return await this.setPassword(id, newPassword, trx);
    }

    async setPassword(id, password, trx) {

        const { Users } = this.server.models();

        return await Users.query(trx).throwIfNotFound().where({ id }).patch({
            password: await this.pwd.hash(Buffer.from(password))
        }).returning('*');
    }

    async requestPasswordReset(email, trx) {

        const { Users } = this.server.models();
        const { emailService } = this.server.services();

        const rawResetToken = Buffer.from(Uuid({ rng: Uuid.nodeRNG }));

        const hash = await this.pwd.hash(rawResetToken);

        const patchedUser = await Users.query()
            .patch({ 'password': null, resetToken: hash.toString('utf8') })
            .where({ email })
            .first()
            .returning('*');

        if (!patchedUser) {
            throw Boom.badRequest('Unable to intiate password reset');
        }


        const resetUrl = this.options.siteUrl + '/password-reset?t=' + rawResetToken;

        await emailService.send('password-reset', patchedUser, { resetUrl });
        return null;
    }

    async resetPassword({ email, resetToken, newPassword }, trx) {

        const { Users } = this.server.models();

        const foundUser = await Users.query()
            .where({ email })
            .whereNotNull('resetToken')
            .first();

        if (!foundUser) {
            throw Boom.badRequest('Unable to reset password');
        }

        const result = await this.pwd.verify(Buffer.from(resetToken), foundUser.resetToken);

        // $lab:coverage:off$
        if (result === SecurePassword.INVALID ||
            result === SecurePassword.INVALID_UNRECOGNIZED_HASH) {
            // $lab:coverage:on$

            throw Boom.badRequest('Unable to reset password');
        }

        return await this.setPassword(foundUser.id, newPassword, trx);
    }
};

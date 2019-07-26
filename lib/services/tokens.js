'use strict';

const JWT = require('jsonwebtoken');
const Schmervice = require('schmervice');

module.exports = class TokenService extends Schmervice.Service {

    async createToken(user) {

        const { Tokens } = this.server.models();

        const newToken = await Tokens.query().insertAndFetch({});

        await newToken.$relatedQuery('user').relate(user);

        const signed = await JWT.sign({
            jti: newToken.id,
            userId: user.id,
            scope: user.role
        },
        this.options.jwtKey,
        {
            algorithm: 'HS256',
            expiresIn: '7d'
        });

        return signed;
    }

    async delete(id, trx) {

        const { Tokens } = this.server.models();

        await Tokens.query(trx).throwIfNotFound().delete().where({ id });
    }

    async deleteAll(userId, trx) {

        const { Tokens } = this.server.models();

        await Tokens.query(trx).throwIfNotFound().delete().where({ userId });
    }

};

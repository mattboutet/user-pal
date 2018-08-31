'use strict';

const internals = {};

module.exports = (srv, options) => {

    return {
        name: 'api-user-jwt',
        scheme: 'jwt',
        options: {
            apiUserJwt: true,
            key: options.jwtKey,
            validate: internals.validate,
            verifyOptions: { algorithms: ['HS256'] } // pick a strong algorithm
        }
    };
};

internals.validate = async function (decoded, request) {

    const { Tokens } = request.models();

    const foundToken = await Tokens.query().findById(decoded.jti).eager('user');

    if (foundToken) {
        return { isValid: true, user: foundToken.user };
    }

    return { isValid: false };
};

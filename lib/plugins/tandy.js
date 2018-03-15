'use strict';

// Leaving empty leads to default (requiring module by file name to set as registered plugin)
// module.exports = {};
module.exports = {
    plugins: {
        options: {
            actAsUser: true,
            userIdProperty: 'userId',//as it's going to appear in the jwt
            userUrlPrefix: '/user',
            userModel: 'users',
            prefix: process.env.API_PREFIX
        }
    }
};

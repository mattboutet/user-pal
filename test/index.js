'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Server = require('../server');
const Package = require('../package.json');

// Test shortcuts

const { describe, it, before } = exports.lab = Lab.script();
const { expect } = Code;

let server = {};
let jwt;
let jwt2;

describe('Deployment', () => {

    before(async () => {

        server = await Server.deployment();
        await server.knex().seed.run({ directory: 'test/seeds' });
    });

    it('registers the main plugin.', () => {

        expect(server.registrations[Package.name]).to.exist();
    });

    it('creates a new user', async () => {

        const options = {
            method: 'POST',
            url: '/api/users',
            payload: {
                email: 'test@test.com',
                password: 'password',
                firstName: 'Test',
                lastName: 'Test'
            }
        };

        const res = await server.inject(options);

        const result = res.result;

        expect(res.statusCode).to.equal(200);
        expect(result).to.be.an.object();
        expect(result.email).to.equal('test@test.com');
    });

    it('creates a new user with a dupe email', async () => {

        const options = {
            method: 'POST',
            url: '/api/users',
            payload: {
                email: 'test@TEST.com',
                password: 'password',
                firstName: 'Test1',
                lastName: 'Test1'
            }
        };

        const res = await server.inject(options);

        expect(res.statusCode).to.equal(400);
    });

    it('creates a new user and generates a non-constraint db error', async () => {

        const options = {
            method: 'POST',
            url: '/api/users',
            payload: {
                email: 'test@TEST.com',
                password: 'password',
                firstName: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like) It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)',
                lastName: 'Test1'
            }
        };

        const res = await server.inject(options);

        expect(res.statusCode).to.equal(500);
    });

    it('Logs a user in', async () => {

        const options = {
            method: 'POST',
            url: '/api/login',
            payload: {
                email: 'test@test.com',
                password: 'password'
            }
        };
        const response = await server.inject(options);
        jwt = response.result;
        expect(response.statusCode).to.equal(200);
        expect(jwt).to.be.a.string();
    });

    it('Logs a nonexistent user in', async () => {

        const options = {
            method: 'POST',
            url: '/api/login',
            payload: {
                email: 'foo@test.com',
                password: 'password'
            }
        };
        const response = await server.inject(options);
        expect(response.statusCode).to.equal(401);
    });

    it('Logs a user in with wrong password', async () => {

        const options = {
            method: 'POST',
            url: '/api/login',
            payload: {
                email: 'test@test.com',
                password: 'notPassword'
            }
        };
        const response = await server.inject(options);
        expect(response.statusCode).to.equal(401);
    });

    it('Fetches all users', async () => {

        const options = {
            method: 'GET',
            url: '/api/users',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);
        const result = response.result;

        expect(response.statusCode).to.equal(200);
        expect(result).to.be.an.array();
        expect(result.length).to.equal(5);
    });

    it('Fetches logged in user', async () => {

        const options = {
            method: 'GET',
            url: '/api/user',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);
        const result = response.result;

        expect(response.statusCode).to.equal(200);
        expect(result).to.be.an.object();
        expect(result.id).to.equal(5);
    });

    it('Fetches user by ID', async () => {

        const options = {
            method: 'GET',
            url: '/api/users/3',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);
        const result = response.result;

        expect(response.statusCode).to.equal(200);
        expect(result).to.be.an.object();
        expect(result.id).to.equal(3);
    });

    it('Changes user password', async () => {

        const changeOptions = {
            method: 'POST',
            url: '/api/users/change-password',
            payload: {
                password: 'password',
                newPassword: 'newPassword'
            },
            headers: {
                authorization: jwt
            }
        };

        const changeResponse = await server.inject(changeOptions);
        expect(changeResponse.statusCode).to.equal(200);

        const badLoginOptions = {
            method: 'POST',
            url: '/api/login',
            payload: {
                email: 'test@test.com',
                password: 'password'
            }
        };
        const badLoginResponse = await server.inject(badLoginOptions);
        expect(badLoginResponse.statusCode).to.equal(401);

        const loginOptions = {
            method: 'POST',
            url: '/api/login',
            payload: {
                email: 'test@test.com',
                password: 'newPassword'
            }
        };
        const loginResponse = await server.inject(loginOptions);
        jwt2 = loginResponse.result;
        expect(loginResponse.statusCode).to.equal(200);
        expect(jwt2).to.be.a.string();
    });

    it('Changes user password to the same value, fails', async () => {

        const changeOptions = {
            method: 'POST',
            url: '/api/users/change-password',
            payload: {
                password: 'password',
                newPassword: 'password'
            },
            headers: {
                authorization: jwt
            }
        };

        const changeResponse = await server.inject(changeOptions);
        expect(changeResponse.statusCode).to.equal(400);
    });

    it('Tries to change user password, but supplies wrong existing password', async () => {

        const changeOptions = {
            method: 'POST',
            url: '/api/users/change-password',
            payload: {
                password: 'foo',
                newPassword: 'password'
            },
            headers: {
                authorization: jwt
            }
        };

        const changeResponse = await server.inject(changeOptions);
        expect(changeResponse.statusCode).to.equal(400);
    });

    it('Requests password reset, resets password', async () => {

        const requestOptions = {
            method: 'POST',
            url: '/api/users/request-reset',
            payload: {
                email: 'test@test.com'
            }
        };

        const requestResponse = await server.inject(requestOptions);
        const { result } = requestResponse;
        const resetToken = result.split('*')[1];

        expect(requestResponse.statusCode).to.equal(200);
        expect(resetToken).to.be.a.string();

        const resetOptions = {
            method: 'POST',
            url: '/api/users/reset-password',
            payload: {
                email: 'test@test.com',
                resetToken,
                newPassword: 'string'
            }
        };

        const resetResponse = await server.inject(resetOptions);
        expect(resetResponse.statusCode).to.equal(200);

    });

    it('Resets password with bad email', async () => {

        const resetOptions = {
            method: 'POST',
            url: '/api/users/reset-password',
            payload: {
                email: 'nope@test.com',
                resetToken: 'tokenValue',
                newPassword: 'string'
            }
        };

        const resetResponse = await server.inject(resetOptions);
        expect(resetResponse.statusCode).to.equal(400);

    });

    it('Resets password on account that has not requested', async () => {

        const resetOptions = {
            method: 'POST',
            url: '/api/users/reset-password',
            payload: {
                email: 'test@test.com',
                resetToken: 'badTokenValue',
                newPassword: 'string'
            }
        };

        const resetResponse = await server.inject(resetOptions);
        expect(resetResponse.statusCode).to.equal(400);

    });

    it('Requests password reset, resets password with bad token', async () => {

        const requestOptions = {
            method: 'POST',
            url: '/api/users/request-reset',
            payload: {
                email: 'a@b.c'
            }
        };

        const requestResponse = await server.inject(requestOptions);
        const { result } = requestResponse;
        const resetToken = result.split('*')[1];

        expect(requestResponse.statusCode).to.equal(200);
        expect(resetToken).to.be.a.string();

        const resetOptions = {
            method: 'POST',
            url: '/api/users/reset-password',
            payload: {
                email: 'a@b.c',
                resetToken: 'notCorrectToken',
                newPassword: 'string'
            }
        };

        const resetResponse = await server.inject(resetOptions);
        expect(resetResponse.statusCode).to.equal(401);

    });

    it('Logs out user of one session', async () => {

        const options = {
            method: 'POST',
            url: '/api/logout',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);

        //ensure that 2nd session is still valid
        const fetchOptions = {
            method: 'GET',
            url: '/api/user',
            headers: {
                authorization: jwt2
            }
        };

        const fetchResponse = await server.inject(fetchOptions);
        const result = fetchResponse.result;

        expect(fetchResponse.statusCode).to.equal(200);
        expect(result).to.be.an.object();
    });

    it('Logs out user of all sessions', async () => {

        const options = {
            method: 'POST',
            url: '/api/logout-all',
            headers: {
                authorization: jwt2
            }
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);
    });

    it('Fetches logged in user with valid jwt that has been logged out', async () => {

        const options = {
            method: 'GET',
            url: '/api/user',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(401);
    });
});

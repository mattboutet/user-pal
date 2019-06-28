'use strict';

const Code = require('@hapi/code');
const KnexMigrate = require('knex-migrate');
const Lab = require('@hapi/lab');
const SecurePassword = require('secure-password');
const Server = require('../server');
const Uuid = require('uuid');

const Package = require('../package.json');

const Pwd = new SecurePassword();

// Test shortcuts
const { describe, it, before } = exports.lab = Lab.script();
const { expect } = Code;

let server = {};
let jwt;
let jwtAdmin;
let jwt2;
let rawResetToken;

describe('Deployment', () => {

    before(async () => {

        server = await Server.deployment();

        //start with clean DB
        await KnexMigrate('down', { to: 0 });
        await KnexMigrate('up', {});

        await server.knex().seed.run({ directory: 'test/seeds' });

        //Set up user in mid-reset so we can test later
        const { Users } = server.models();
        rawResetToken = Buffer.from(Uuid({ rng: Uuid.nodeRNG }));

        const hash = Pwd.hashSync(rawResetToken);
        rawResetToken = rawResetToken.toString('utf8');
        await Users.query()
            .patch({ 'password': null, resetToken: hash.toString('utf8') })
            .where('email','a@b.c');

    });

    it('registers the main plugin.', () => {

        expect(server.registrations[Package.name]).to.exist();
    });

    it('creates a new user', async () => {

        const options = {
            method: 'POST',
            url: '/users',
            payload: {
                email: 'test@test.com',
                password: 'password',
                firstName: 'Test',
                lastName: 'Test',
                role: 'user'
            }
        };

        const res = await server.inject(options);

        const result = res.result;

        expect(res.statusCode).to.equal(200);
        expect(result).to.be.an.object();
        expect(result.email).to.equal('test@test.com');
    });

    it('creates a new admin', async () => {

        const options = {
            method: 'POST',
            url: '/users',
            payload: {
                email: 'admin@test.com',
                password: 'password',
                firstName: 'Admin',
                lastName: 'Test',
                role: 'admin'
            }
        };
        const res = await server.inject(options);
        const result = res.result;
        expect(res.statusCode).to.equal(200);
        expect(result).to.be.an.object();
        expect(result.role).to.equal('admin');
        expect(result.email).to.equal('admin@test.com');
    });

    it('creates a new user with a dupe email', async () => {

        const options = {
            method: 'POST',
            url: '/users',
            payload: {
                email: 'test@TEST.com',
                password: 'password',
                firstName: 'Test1',
                lastName: 'Test1',
                role: 'user'
            }
        };

        const res = await server.inject(options);

        expect(res.statusCode).to.equal(400);
    });

    it('creates a new user and generates a non-constraint db error', async () => {

        const options = {
            method: 'POST',
            url: '/users',
            payload: {
                email: 'test@TEST.com',
                password: 'password',
                firstName: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like) It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)',
                lastName: 'Test1',
                role: 'user'
            }
        };

        const res = await server.inject(options);

        expect(res.statusCode).to.equal(500);
    });

    it('Logs a user in', async () => {

        const options = {
            method: 'POST',
            url: '/login',
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

    it('Logs an admin in', async () => {

        const options = {
            method: 'POST',
            url: '/login',
            payload: {
                email: 'admin@test.com',
                password: 'password'
            }
        };
        const response = await server.inject(options);
        jwtAdmin = response.result;
        expect(response.statusCode).to.equal(200);
        expect(jwtAdmin).to.be.a.string();
    });

    it('Logs a nonexistent user in', async () => {

        const options = {
            method: 'POST',
            url: '/login',
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
            url: '/login',
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
            url: '/users',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);
        const result = response.result;

        expect(response.statusCode).to.equal(200);
        expect(result).to.be.an.array();
        expect(result.length).to.equal(7);
    });

    it('Fetches logged in user', async () => {

        const options = {
            method: 'GET',
            url: '/user',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);
        const result = response.result;

        expect(response.statusCode).to.equal(200);
        expect(result).to.be.an.object();
        expect(result.id).to.equal(6);
    });

    it('Fetches user by ID', async () => {

        const options = {
            method: 'GET',
            url: '/users/3',
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
            url: '/users/change-password',
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
            url: '/login',
            payload: {
                email: 'test@test.com',
                password: 'password'
            }
        };
        const badLoginResponse = await server.inject(badLoginOptions);
        expect(badLoginResponse.statusCode).to.equal(401);

        const loginOptions = {
            method: 'POST',
            url: '/login',
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
            url: '/users/change-password',
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
            url: '/users/change-password',
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

    it('Requests password reset', async () => {

        const requestOptions = {
            method: 'POST',
            url: '/users/request-reset',
            payload: {
                email: 'success@simulator.amazonses.com'
            }
        };

        const requestResponse = await server.inject(requestOptions);
        const { result } = requestResponse;

        expect(requestResponse.statusCode).to.equal(200);
        expect(result).to.be.a.string();
        //
        // const resetOptions = {
        //     method: 'POST',
        //     url: '/users/reset-password',
        //     payload: {
        //         email: 'test@test.com',
        //         resetToken,
        //         newPassword: 'string'
        //     }
        // };
        //
        // const resetResponse = await server.inject(resetOptions);
        // expect(resetResponse.statusCode).to.equal(200);

    });

    it('Resets Password', async () => {

        const resetOptions = {
            method: 'POST',
            url: '/users/reset-password',
            payload: {
                email: 'a@b.c',
                resetToken: rawResetToken,
                newPassword: 'string'
            }
        };

        const resetResponse = await server.inject(resetOptions);

        expect(resetResponse.statusCode).to.equal(200);

    });

    it('Resets password with bad email', async () => {

        const resetOptions = {
            method: 'POST',
            url: '/users/reset-password',
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
            url: '/users/reset-password',
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
            url: '/users/request-reset',
            payload: {
                email: 'success@simulator.amazonses.com'
            }
        };

        const requestResponse = await server.inject(requestOptions);
        const { result } = requestResponse;

        expect(requestResponse.statusCode).to.equal(200);
        expect(result).to.be.a.string();
        expect(result).to.equal('Check your email for a reset link');

        const resetOptions = {
            method: 'POST',
            url: '/users/reset-password',
            payload: {
                email: 'success@simulator.amazonses.com',
                resetToken: 'notCorrectToken',
                newPassword: 'string'
            }
        };

        const resetResponse = await server.inject(resetOptions);
        expect(resetResponse.statusCode).to.equal(401);

    });

    it('Requests password reset for nonexistent user', async () => {

        const requestOptions = {
            method: 'POST',
            url: '/users/request-reset',
            payload: {
                email: 'cheese@burger.com'
            }
        };

        const requestResponse = await server.inject(requestOptions);

        expect(requestResponse.statusCode).to.equal(401);
    });

    it('Attempts to delete a user as non admin', async () => {

        const requestOptions = {
            method: 'DELETE',
            url: '/users/5',
            headers: {
                authorization: jwt
            }
        };
        const requestResponse = await server.inject(requestOptions);
        expect(requestResponse.statusCode).to.equal(403);
    });

    it('Deletes a user', async () => {

        const requestOptions = {
            method: 'DELETE',
            url: '/users/5',
            headers: {
                authorization: jwtAdmin
            }
        };
        const requestResponse = await server.inject(requestOptions);
        expect(requestResponse.statusCode).to.equal(204);
    });

    it('Logs out user of one session', async () => {

        const options = {
            method: 'POST',
            url: '/logout',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);

        //ensure that 2nd session is still valid
        const fetchOptions = {
            method: 'GET',
            url: '/user',
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
            url: '/logout-all',
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
            url: '/user',
            headers: {
                authorization: jwt
            }
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(401);
    });
});

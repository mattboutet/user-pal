'use strict';

const Helpers = require('../helpers');
const Joi = require('@hapi/joi');

const internals = {};

module.exports = (server, options) => {

    //CRUD handlers that are taken care of with Tandy.  Anything
    //more involved should be broken out into its own file.
    return [
        Helpers.withDefaults({
            method: 'GET',
            path: '/users/{id}',
            options: {
                description: 'Get a user',
                tags: ['api'],
                validate: {
                    headers: Joi.object({
                        authorization: Joi.string()
                            .description('JWT')
                    }).unknown(),
                    params: {
                        id: Joi.number().integer().required()
                    }
                },
                auth: {
                    strategy: 'api-user-jwt'
                }
            },
            handler: { tandy: {} }
        }),
        Helpers.withDefaults({
            method: 'get',
            path: '/user',
            options: {
                description: 'Get logged-in user',
                tags: ['api'],
                validate: {
                    headers: Joi.object({
                        authorization: Joi.string()
                            .description('JWT')
                    }).unknown()
                },
                auth: {
                    strategy: 'api-user-jwt'
                }
            },
            handler: { tandy: {} }
        }),
        Helpers.withDefaults({
            method: 'GET',
            path: '/users',
            options: {
                description: 'Get all users',
                tags: ['api'],
                validate: {
                    headers: Joi.object({
                        authorization: Joi.string()
                            .description('JWT')
                    }).unknown()
                },
                auth: {
                    strategy: 'api-user-jwt'
                }
            },
            handler: { tandy: {} }
        }),
        Helpers.withDefaults({
            method: 'DELETE',
            path: '/users/{id}',
            options: {
                description: 'Delete a user',
                tags: ['api'],
                validate: {
                    headers: Joi.object({
                        authorization: Joi.string()
                            .description('JWT')
                    }).unknown(),
                    params: {
                        id: Joi.number().integer().required()
                    }
                },
                auth: {
                    strategy: 'api-user-jwt',
                    scope: 'admin'
                }
            },
            handler: { tandy: {} }
        })
    ];
};

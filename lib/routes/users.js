'use strict';

const Joi = require('@hapi/joi');

const internals = {};

module.exports = (server, options) => {

    //CRUD handlers that are taken care of with Tandy.  Anything
    //more involved should be broken out into its own file.
    return [
        {
            method: 'GET',
            path: '/users/{id}',
            config: {
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
        },
        {
            method: 'GET',
            path: '/user',
            config: {
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
        },
        {
            method: 'GET',
            path: '/users',
            config: {
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
        },
        {
            method: 'DELETE',
            path: '/users/{id}',
            config: {
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
        }
    ];
};

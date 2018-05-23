'use strict';
const { graphqlHapi: GraphqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema: MakeExecutableSchema } = require('graphql-tools');
const { PubSub } = require('graphql-subscriptions');
const Joi = require('joi');

const { graphql: Graphql, GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLString } = require('graphql');
const GraphQlBuilder = require('objection-graphql').builder;

module.exports = {

        dependencies: 'schwifty',
        after: (server) => {

            const { Users, Tokens, Projects } = server.models();
            //Subscription stuff is untested, but seems to be working.
            //Comment out for now to remove confounding variables as I
            //work through auth stuff.
            // const pubSub = new PubSub();

            //Why is this needed, seems shitty?
            const projectType = new GraphQLObjectType({
                name: 'ProjectType',
                description: 'Use this object to create new project',
                fields: () => ({
                    id: {
                        type: new GraphQLNonNull(GraphQLInt),
                        description: 'ID',
                    },
                    name: {
                        type: new GraphQLNonNull(GraphQLString),
                        description: 'Name',
                    },
                    userId: {
                        type: new GraphQLNonNull(GraphQLInt),
                        description: 'Assoc User ID',
                    },
                }),
            });

            // const subscriptionType = new GraphQLObjectType({
            //     name: 'RootSubscriptionType',
            //     description: 'Domain subscriptions',
            //     fields: () => ({
            //         projectCreated: {
            //             description: 'A new project created',
            //             type: projectType,
            //             resolve: (payload) => payload,
            //             subscribe: () => pubSub.asyncIterator('PROJECT_CREATED'),
            //         },
            //     }),
            // });

            // fieldname and listfieldname are artifacts of our plural model names
            // convention.  GraphQLBuilder assumes model will be singular, so without
            // this stuff, you'd have to query against userss or tokenss to get lists.
            const myNewSchema = GraphQlBuilder()
                .model(Users, { fieldName: 'user', listFieldName: 'users' })
                .model(Tokens, { fieldName: 'token', listFieldName: 'tokens' })
                .model(Projects, { fieldName: 'project', listFieldName: 'projects' })
                // .extendWithSubscriptions(subscriptionType)
                .build();

            server.register({
                plugin: GraphqlHapi,
                options: {
                    path: '/graphql',
                    graphqlOptions: {
                        schema: myNewSchema,
                    },
                    route: {
                        cors: true,
                    },
                    validate: {
                        headers: Joi.object({
                            authorization: Joi.string()
                                .description('JWT')
                        }).unknown()
                    },
                    auth: {
                        strategy: 'api-user-jwt'
                    },
                    handler: async (request, h) => {


                    }
                }
            });
        }
};

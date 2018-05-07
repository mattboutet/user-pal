'use strict';
const { graphqlHapi: GraphqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema: MakeExecutableSchema } = require('graphql-tools');

const Graphql = require('graphql').graphql;
const GraphQlBuilder = require('objection-graphql').builder;

module.exports = {

        dependencies: 'schwifty',
        after: (server) => {

            const { Users, Tokens } = server.models();

            const myNewSchema = GraphQlBuilder().model(Users).model(Tokens).build();

            server.register({ plugin: GraphqlHapi,
                options: {
                    path: '/graphql',
                    graphqlOptions: {
                        schema: myNewSchema,
                    },
                    route: {
                        cors: true,
                    }
                }
            });
        }
};

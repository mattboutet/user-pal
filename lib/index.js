'use strict';

const HauteCouture = require('haute-couture');
const Package = require('../package.json');
const { graphqlHapi: GraphqlHapi, graphiqlHapi: GraphiqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema: MakeExecutableSchema } = require('graphql-tools');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {

        // Custom plugin code can go here

        await server.register({
            plugin: GraphiqlHapi,
            options: {
                path: '/graphiql',
                graphiqlOptions: {
                    endpointURL: '/graphql',
                },
            },
        });

        await HauteCouture.using()(server, options);
    }
};

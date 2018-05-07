'use strict';

const HauteCouture = require('haute-couture');
const Package = require('../package.json');
const { graphqlHapi: GraphqlHapi, graphiqlHapi: GraphiqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema: MakeExecutableSchema } = require('graphql-tools');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {

        // Custom plugin code can go here

        // // Some fake data
        // const books = [
        //     {
        //         title: "Harry Potter and the Sorcerer's stone",
        //         author: 'J.K. Rowling',
        //     },
        //     {
        //         title: 'Jurassic Park',
        //         author: 'Michael Crichton',
        //     }
        // ];
        //
        // // The GraphQL schema in string form
        // // The string form thing is gross.  why?
        // const typeDefs = `
        //     type Query { books: [Book] }
        //     type Book { title: String, author: String }
        // `;
        //
        // // The resolvers
        // const resolvers = {
        //     Query: { books: () => books },
        // };
        //
        // // Put together a schema
        // const schema = MakeExecutableSchema({
        //     typeDefs,
        //     resolvers,
        // });

        // await server.register({
        //     plugin: GraphqlHapi,
        //     options: {
        //         path: '/graphql',
        //         graphqlOptions: {
        //             schema: schema,
        //         },
        //         route: {
        //             cors: true,
        //         },
        //     },
        // });

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

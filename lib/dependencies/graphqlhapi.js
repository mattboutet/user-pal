'use strict';
const { graphqlHapi: GraphqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema: MakeExecutableSchema } = require('graphql-tools');

const Graphql = require('graphql').graphql;
const GraphQlBuilder = require('objection-graphql').builder;

// const Users = require('../models/Users');
// const Tokens = require('../models/Tokens');

// const myNewSchema = GraphQlBuilder().model(Users).model(Tokens).build();

//TODO move all this crap out of the plugin registraion FIXME
// Some fake data
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
// console.log(GraphqlHapi);
// The GraphQL schema in string form
// The string form thing is gross.  why?
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
// console.log('apollo schema', schema);
// const after = (server) => {
//
//     console.log(server.models(true));
//     server.register({
//         plugins: { plugin: GraphqlHapi,
//             options: {
//                 path: '/graphql',
//                 graphqlOptions: {
//                     schema: schema,
//                 },
//                 route: {
//                     cors: true,
//                 }
//             }
//         }
//     });
//     next();
// };


module.exports = {

        dependencies: 'schwifty',
        after: (server) => {

            const { Users, Tokens } = server.models();

            const myNewSchema = GraphQlBuilder().model(Users).model(Tokens).build();
console.log('objection schema', myNewSchema._typeMap.UsersPropertiesEnum);
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




// a plugin file exports `{ plugins, options }`
// `plugins` is identical to the first arg of
// `server.register()`, and `options` the second argument


// module.exports = (server, options) => {

    //console.log(server);

    // return server.dependency('schwifty', after);

    // return {
    //     plugins: { plugin: GraphqlHapi,
    //         options: {
    //             path: '/graphql',
    //             graphqlOptions: {
    //                 schema: schema,
    //             },
    //             route: {
    //                 cors: true,
    //             }
    //         }
    //     }
    // };
// };

// module.exports = {
//     plugins: { plugin: GraphqlHapi,
//         options: {
//             path: '/graphql',
//             graphqlOptions: {
//                 schema: schema,
//             },
//             route: {
//                 cors: true,
//             }
//         }
//     }
// };

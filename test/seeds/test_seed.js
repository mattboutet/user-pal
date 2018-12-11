'use strict';

exports.seed = function (knex, Promise) {

    return knex('Users').then(() => {

        return Promise.all([
            // Inserts seed entries
            knex('Users').insert({ email: 'a@b.c', firstName: 'a', lastName: 'b', role: 'user' }),
            knex('Users').insert({ email: 'success@simulator.amazonses.com', firstName: 'amazon', lastName: 'success', role: 'user' }),
            knex('Users').insert({ email: 'c@d.e', firstName: 'c', lastName: 'd', role: 'user' }),
            knex('Users').insert({ email: 'a@d.e', firstName: 'a', lastName: 'd', role: 'user' }),
            knex('Users').insert({ email: 'd@d.e', firstName: 'd', lastName: 'd', role: 'user' }),
            knex('Tokens').insert({ id: 99, userId: 1 }),
            knex('Tokens').insert({ id: 98, userId: 1 }),
            knex('Tokens').insert({ id: 97, userId: null })
        ]);
    });
};

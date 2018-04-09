'use strict';

exports.seed = function (knex, Promise) {

    return knex('Users').then(() => {

        return Promise.all([
            // Inserts seed entries
            knex('Users').insert({ email: 'a@b.c', firstName: 'a', lastName: 'b' }),
            knex('Users').insert({ email: 'c@d.e', firstName: 'c', lastName: 'd' }),
            knex('Users').insert({ email: 'a@d.e', firstName: 'a', lastName: 'd' }),
            knex('Users').insert({ email: 'd@d.e', firstName: 'd', lastName: 'd' }),
            knex('Tokens').insert({ id: 99, userId: 1 }),
            knex('Tokens').insert({ id: 98, userId: 1 }),
            knex('Tokens').insert({ id: 97, userId: null })
        ]);
    });
};

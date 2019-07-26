'use strict';

exports.seed = function (knex, Promise) {

    return knex('Users').then(() => {

        return Promise.all([
            // Inserts seed entries
            knex('Users').insert({ email: 'a@b.com', firstName: 'a', lastName: 'b', role: 'user' }),
            knex('Users').insert({ email: 'success@simulator.amazonses.com', firstName: 'amazon', lastName: 'success', role: 'user' }),
            knex('Users').insert({ email: 'c@d.com', firstName: 'c', lastName: 'd', role: 'user' }),
            knex('Users').insert({ email: 'a@d.com', firstName: 'a', lastName: 'd', role: 'user' }),
            knex('Users').insert({ email: 'd@d.com', firstName: 'd', lastName: 'd', role: 'user' })
        ]);
    });
};

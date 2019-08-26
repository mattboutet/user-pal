'use strict';

exports.seed = async (knex) => {

    return await knex('Users').insert([{ email: 'a@b.com', firstName: 'a', lastName: 'b', role: 'user' },
        { email: 'success@simulator.amazonses.com', firstName: 'amazon', lastName: 'success', role: 'user' },
        { email: 'c@d.com', firstName: 'c', lastName: 'd', role: 'user' },
        { email: 'a@d.com', firstName: 'a', lastName: 'd', role: 'user' },
        { email: 'd@d.com', firstName: 'd', lastName: 'd', role: 'user' }
    ]);
};

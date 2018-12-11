'use strict';

exports.up = (knex, Promise) => {

    return knex.schema.table('Users', (table) => {

        table.string('role');
    });
};

exports.down = (knex, Promise) => {

    // $lab:coverage:off$
    return knex.schema.table('Users', (table) => {

        table.dropColumn('role');
    });
    // $lab:coverage:on$
};

'use strict';

exports.up = (knex, Promise) => {

    return knex.schema
        .createTable('Projects', (table) => {

            table.increments('id').primary();
            table.string('name');
            table.integer('userId')
                .references('id')
                .inTable('Users')
                .onDelete('CASCADE');
            table.timestamp('createdAt');
            table.timestamp('updatedAt');

        });
};

exports.down = (knex, Promise) => {

    //this code gets run outside of lab's view, so doesn't get counted in coverage
    // $lab:coverage:off$
    return knex.schema.dropTable('Projects');
    // $lab:coverage:on$
};

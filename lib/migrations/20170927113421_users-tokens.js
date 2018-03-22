'use strict';

exports.up = (knex, Promise) => {

    //create extension requires elevated privs, and it's not recommended to run
    //your app with a user that has more privileges than necessary.  For local
    //development, it's fine to do this - you can just uncomment the line below.
    //In any other environment, you should log into your database directly as a
    //privileged user and create the extension by hand.

    return knex.schema/*.raw('CREATE EXTENSION IF NOT EXISTS citext')*/
        .createTable('Users', (table) => {

            table.increments('id').primary();
            table.specificType('email', 'citext').notNullable().unique();
            //table.string('email').notNullable().unique(); /*use if citext extension not available*/
            table.binary('password');
            table.string('firstName').notNullable();
            table.string('lastName').notNullable();
            table.binary('resetToken');
            table.timestamp('createdAt');
            table.timestamp('updatedAt');

        }).createTable('Tokens', (table) => {

            table.string('id').primary();
            table.integer('userId')
                .references('id')
                .inTable('Users')
                .onDelete('CASCADE');
            table.timestamp('createdAt');
        });
};

exports.down = (knex, Promise) => {

    //this code gets run outside of lab's view, so doesn't get counted in coverage
    // $lab:coverage:off$
    return knex.schema.dropTable('Tokens')
        .dropTable('Users');
    // .raw('DROP EXTENSION IF EXISTS citext');//Only uncomment in parallel with above
    // $lab:coverage:on$
};

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
        }).createTable('Tokens', (table) => {

            table.string('id').primary();
            table.integer('userId')
                .references('id')
                .inTable('Users');
        });
};

exports.down = (knex, Promise) => {

    return knex.schema.dropTable('Users')
        .dropTable('Tokens')
        .raw('DROP EXTENSION IF EXISTS citext');
};

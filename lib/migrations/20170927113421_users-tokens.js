'use strict';

exports.up = (knex, Promise) => {

    return knex.schema.createTable('Users', (table) => {

        table.increments('id').primary();
        table.string('email').notNullable().unique();
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
        .dropTable('Tokens');
};

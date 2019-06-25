'use strict';

const Model = require('schwifty').Model;
const Joi = require('@hapi/joi');

module.exports = class Users extends Model {

    static get tableName() {

        return 'Users';
    }

    static get joiSchema() {

        return Joi.object({

            id: Joi.number().integer().min(1),
            email: Joi.string().email(),
            password: Joi.binary().allow(null),
            firstName: Joi.string(),
            lastName: Joi.string(),
            role: Joi.string().valid(['admin', 'user']),
            resetToken: Joi.binary().allow(null),
            createdAt: Joi.date().iso(),
            updatedAt: Joi.date().iso()
        });
    }

    static get relationMappings() {

        return {
            tokens: {
                relation: Model.HasManyRelation,
                modelClass: require('./Tokens'),
                join: {
                    from: 'Users.id',
                    to: 'Tokens.userId'
                }
            }
        };
    }

    $formatJson(json) {

        json = super.$formatJson(json);

        delete json.password;
        delete json.resetToken;

        return json;
    }

    $parseDatabaseJson(json) {

        json = super.$parseDatabaseJson(json);

        json.fullName = json.firstName + ' ' + json.lastName;
        return json;
    }

    $beforeInsert() {

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    $beforeUpdate() {

        this.updatedAt = new Date().toISOString();
    }
};

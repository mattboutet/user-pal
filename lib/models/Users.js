'use strict';

const Model = require('schwifty').Model;
const Joi = require('joi');

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
            resetToken: Joi.binary().allow(null),
            createdAt: Joi.date().iso(),
            updatedAt: Joi.date().iso()
        });
    }

    // joi-to-json-schema can't handle some times (in this case binary and date)
    static get jsonSchema() {

        //I don't yet know how to get GraphQL to cleanly handle binary types,
        //Also, not yet clear to me that those values are needed via graphql, so punt.
        return {
                type: 'object',
                required: [],
                properties: {
                    id: { type: 'integer' },
                    email: { type: 'string', minLength: 1, maxLength: 255 },
                    // password: { type: ['string', 'null'] },
                    firstName: { type: 'string', minLength: 1, maxLength: 255 },
                    lastName: { type: 'string', minLength: 1, maxLength: 255 },
                    // resetToken: { type: ['string', 'null'] },
                    createdAt: { type: ['string', 'null'] },
                    updatedAt: { type: ['string', 'null'] }
                }
        };
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
            },
            projects: {
                relation: Model.HasManyRelation,
                modelClass: require('./Projects'),
                join: {
                    from: 'Users.id',
                    to: 'Projects.userId'
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

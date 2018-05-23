'use strict';

const Model = require('schwifty').Model;
const Joi = require('joi');

module.exports = class Projects extends Model {

    static get tableName() {

        return 'Projects';
    }

    static get joiSchema() {

        return Joi.object({

            id: Joi.number().integer().min(1),
            name: Joi.string(),
            userId: Joi.number().integer().min(1),
            createdAt: Joi.date().iso(),
            updatedAt: Joi.date().iso()
        });
    }

    static get jsonSchema() {

        return {
            type: 'object',
            required: [],
            properties: {
                id: { type: 'integer' },
                name: { type: 'string', minLength: 1, maxLength: 255 },
                createdAt: { type: ['string', 'null'] },
                updatedAt: { type: ['string', 'null'] }
            }
        };
    }

    $beforeInsert() {

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    $beforeUpdate() {

        this.updatedAt = new Date().toISOString();
    }
};

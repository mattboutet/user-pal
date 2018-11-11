'use strict';

const HauteCouture = require('haute-couture');
const Package = require('../package.json');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {

        // Custom plugin code can go here
        // $lab:coverage:off$
        if (!options.siteUrl || !options.jwtKey) {
            throw new Error('Missing required plugin option.  Compare your .env to the provided .env-keep file');
        }
        // $lab:coverage:on$

        await HauteCouture.using()(server, options);
    }
};

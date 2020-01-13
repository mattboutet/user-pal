# User pal

A batteries included version of [hapi pal](https://github.com/hapipal/boilerplate/)

**Features**
 - Supports hapi v19+
 - Provides conventions for building plugins by mapping the entire hapi plugin API onto files and folders, using [haute-couture](https://github.com/hapipal/haute-couture/).
 - Integrated with [Objection ORM](https://github.com/Vincit/objection.js/) via [Schwifty](https://github.com/hapipal/schwifty/)
 - Configured to use PostgreSQL (NODE_ENV=development) (though can work with any SQL dialect supported by [knex](http://knexjs.org/))
 - Swagger UI provides an easy interface to your API
 - Fully setup with a [lab](https://github.com/hapijs/lab) test suite and [eslint](https://github.com/eslint/eslint) configuration.
 - Up-to-date versions of all dependencies.
 - Supports hapi pal [Flavors](https://github.com/hapipal/boilerplate/#flavors) with the deployment, objection, and swagger flavors already included.

## Getting Started
```bash
$ git clone --depth=1 --origin=user-pal git@github.com:mattboutet/user-pal.git my-project
$ cd my-project
$ git checkout --orphan master # New branch without history
$ npm install
$ cp server/.env-keep server/.env
$ cp server/.env server/.env-test
```

Open `.env` and `.env-test` in your editor of choice and fill in the variables there (presumes you've created empty databases in the SQL dialect of your choice).  `.env-test` should point at a different database from `.env`, as all data will be lost each time `npm run test` is executed.

If you'll be connecting to a PostgreSQL database, ensure that your database is properly configured with the `citext` extension (see [Working with PostgreSQL's citext Extension](#working-with-postgresqls-citext-extension)) below.

If you aren't using PostgreSQL, comment out or delete the `citext` column command and uncomment the generic email column command in the [migration file](lib/migrations/20170927113421_users-tokens.js). You may want to consider taking some other additional step to prevent mis-identifying users due to inconsistent email casing (reason described below). For example, using [Objection's $beforeInsert](https://vincit.github.io/objection.js/#_s_beforeinsert) to normalize email casing on user creation.

```bash
$ npm start
```

Open [http://0.0.0.0:4000/documentation](http://0.0.0.0:4000/documentation) (assuming you used port 4000 in your .env file) in a web browser to start using your api.

When you're ready to point this at your own Github repo and start committing:

```bash
$ git remote add origin git@github.com:my-username/my-project.git
$ npm init # Rename, reversion, describe your plugin
$ git commit -am "Building on top of the user pal boilerplate"
```


### Working with PostgreSQL's `citext` Extension

We use PostgreSQL's `citext` type for the email column for our Users table to ensure user emails are case insensitively unique, which we need to reliably authenticate users. In practice, major email service providers treat email addresses case insensitively e.g. `inbox@email.com` and `InbOx@email.com` identify the same address. Uniqueness is case-sensitive by default, however, meaning that without intervention, our base application would mistakely interpet those 2 casings of the same email address as 2 different users. Because [we depend on email addresses to uniquely identify and authenticate users](lib/routes/users-login.js#L34), we would end up — likely to the user's confusion — telling the same person they exist and don't exist by our accounting depending on how they spell their email on signup and login (consider, for example, that iPhone virtual keyboards autocapitalize the first letters of new words).

To setup `citext` on your new database:

```sh
psql postgres # login as the root user
\connect DB_NAME # connect to your database; you set extensions by database, not globally
CREATE EXTENSION IF NOT EXISTS citext
\dx # lists the extensions added to our database i.e. checks our work
\q
```

Further reading: https://nandovieira.com/using-insensitive-case-columns-in-postgresql-with-citext

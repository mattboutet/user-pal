# User pal

A batteries included version of [hapi pal](https://github.com/devinivy/boilerplate-api)

**Features**
 - Supports hapi v17+
 - Provides conventions for building plugins by mapping the entire hapi plugin API onto files and folders, using [haute-couture](https://github.com/devinivy/haute-couture).
 - Integrated with [Objection ORM](https://github.com/Vincit/objection.js/) via [Schwifty](https://github.com/BigRoomStudios/schwifty/)
 - Configured to use either sqlite3 (if NODE_ENV is undefined) or PostgreSQL (NODE_ENV=development).
 - Swagger UI provides an easy interface to your API
 - Fully setup with a [lab](https://github.com/hapijs/lab) test suite and [eslint](https://github.com/eslint/eslint) configuration.
 - Up-to-date versions of all dependencies.
 - Supports hapi pal [Flavors](https://github.com/devinivy/boilerplate-api#flavors) with the deployment, objection, and swagger flavors already included.

## Getting Started
```bash
$ git clone --depth=1 --origin=user-pal git@github.com:mattboutet/user-pal.git my-project
$ cd my-project
$ git checkout --orphan master # New branch without history
$ npm install
$ cp server/.env-keep server/.env
```

Open `.env` in your editor of choice and fill in the variables there.  If you'll be connecting to a PostgreSQL database, ensure that an empty database exists.

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

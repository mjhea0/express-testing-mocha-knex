# Testing Node and Express

This tutorial looks at how to test an [Express](https://expressjs.com/) CRUD app with [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/). Although we'll be writing both [unit and integration tests](http://stackoverflow.com/questions/5357601/whats-the-difference-between-unit-tests-and-integration-tests), the focus will be on the latter so that tests run against the database in order to test the full functionality of our app. Postgres will be used, but feel free to use your favorite relational database.

Let's get to it!

## Objectives

By the end of this tutorial, you will be able to...

## Why Test?

Are you currently manually testing your app?

When you push new code do you manually test all features in your app to ensure the new code doesn't break existing functionality? How about when you're fixing a bug? Do you manually test your app? How many times?

Stop wasting time!

If you do any sort of manual testing write an automated test instead. Your future self will thank you.

## Getting Started

### Project Set Up

To quickly create an app boilerplate install the following [generator](https://www.npmjs.com/package/generator-galvanize-express):

```sh
$ npm install -g generator-galvanize-express@1.0.5
```

Make sure you have [Mocha](http://mochajs.org/), [Chai](http://chaijs.com/), [Gulp](http://gulpjs.com/), and [Yeoman](http://yeoman.io/) installed globally as well:

```sh
$ npm install -g mocha@3.0.2 chai@3.5.0 yo@1.8.5 gulp@3.9.1
```

Create a new project directory, and then run the generator to scaffold a new app:

```sh
$ yo galvanize-express
```

> **NOTE:** Add your name for the MIT License and do not add Gulp Notify.

Make sure to review the structure.

Install the dependencies:

```sh
$ npm install
```

Finally, let's run the app to make sure all is well:

```sh
$ gulp
```

Navigate to [http://localhost:3000/](http://localhost:3000/) in your favorite browser. You should see:

```
Welcome to Express!
The sum is 3
```

### Database Set Up

Make sure the Postgres database server is running, and then create two new databases in [psql](http://postgresguide.com/utilities/psql.html), for development and testing:

```sh
# create database express_tdd;
CREATE DATABASE
# create database express_tdd_testing;
CREATE DATABASE
#
```

Install Knex and [pg](https://github.com/brianc/node-postgres):

```sh
$ npm install knex@0.11.10 pg@6.1.0 --save-dev
```

Run `knex init` to generate a new *[knexfile.js](http://knexjs.org/#knexfile)* file in the project root, which is used to store database config. Update the file like so:

```javascript
module.exports = {
  development: {
    client: 'postgresql',
    connection: 'postgres://localhost:5432/express_tdd',
    migrations: {
      directory: __dirname + '/src/server/db/migrations'
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds'
    }
  },
  test: {
    client: 'postgresql',
    connection: 'postgres://localhost:5432/express_tdd_testing',
    migrations: {
      directory: __dirname + '/src/server/db/migrations'
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds'
    }
  }
};
```

Here, different database configuration is used based on the app's environment, either `development` or `test`. The [environment variable](https://en.wikipedia.org/wiki/Environment_variable) `NODE_ENV` will be used to change the environment. `NODE_ENV` defaults to `development`, so when we run test, we'll need to update the variable to `test`.

Next, let's init the connection. Create a new folder with "server" called "db" and then add a file called *knex.js*:

```javascript
const environment = process.env.NODE_ENV;
const config = require('../../../knexfile.js')[environment];
module.exports = require('knex')(config);
```

The database connection is establish by passing the proper environment to *knexfile.js* which returns the associated object that gets passed to the `knex` library in the third line above.

> Now is a great time to initilize a new git repo and commit!

### Test Structure

With that complete, let's look at the current test structure. In the "src" directory, you'll notice a "test" directory, which as you probably guessed contains the test specs. Two sample tests have been created, plus there is some basic configuration set up for [JSHint](https://github.com/jshint/jshint) and [JSCS](http://jscs.info/).

Run the tests:

```sh
$ npm test
```

They all should pass:

```sh
jscs
  ✓ should pass for working directory (357ms)

routes : index
  GET /
    ✓ should render the index (88ms)
  GET /404
    ✓ should throw an error

jshint
  ✓ should pass for working directory (247ms)

controllers : index
  sum()
    ✓ should return a total
    ✓ should return an error


6 passing (724ms)
```

Glance at the sample tests. Notice how we are updating the environment variable at the top of each test:

```javascript
process.env.NODE_ENV = 'test';
```

Remember what this does? Now, when we run the tests, knex is intilized with the `test` config.

### Schema Migrations

To keep the code simple, let's use one CRUD resource, `users`:

| Endpoint  | HTTP   | Result               |
|-----------|--------|----------------------|
| users     | GET    | get all users        |
| users/:id | GET    | get a single user    |
| users     | POST   | add a single user    |
| users/:id | PUT    | update a single user |
| users/:id | DELETE | delete a single user |

Init a new migration:

```sh
$ knex migrate:make users
```

This command created a new migration file within the "src/server/db/migrations" folder. Now we can create the table along with the individual fields:

| Field Name  | Data Type | Constraints                                 |
|-------------|-----------|---------------------------------------------|
| id          | integer   | not null, unique                            |
| username    | string    | not null, unique                            |
| email       | string    | not null, unique                            |
| created_at  | timestamp | Not null, default to current date and time  |

Add the following code to the migration file:

```javascript
exports.up = (knex, Promise) => {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('users');
};
```

Apply the migration:

```sh
$ knex migrate:latest --env development
```

Make sure the schema was applied within psql:

```sh
# \c express_tdd
You are now connected to database "express_tdd".
# \dt
                   List of relations
 Schema |         Name         | Type  |     Owner
--------+----------------------+-------+---------------
 public | knex_migrations      | table | michaelherman
 public | knex_migrations_lock | table | michaelherman
 public | users                | table | michaelherman
(3 rows)

# select * from users;
 id | username | email | created_at
----+----------+-------+------------
(0 rows)
```

## Seed

We need to see the database to have some basic data to work with. Init a new seed, which will add a new seed file to "src/server/db/seeds/":

```sh
$ knex seed:make users
```

Update the file:

```sh
exports.seed = (knex, Promise) => {
  // Deletes ALL existing entries
  return knex('users').del()
  .then(() => {
    return Promise.all([
      // Inserts seed entries
      knex('users').insert({
        username: 'michael',
        email: 'michael@mherman.org'
      }),
      knex('users').insert({
        username: 'michaeltwo',
        email: 'michael@realpython.org'
      })
    ]);
  });
};
```

Run the seed:

```sh
$ knex seed:run --env development
```

Then make sure the data is in the database:

```sh
# select * from users;
 id |  username  |         email          |          created_at
----+------------+------------------------+-------------------------------
  1 | michael    | michael@mherman.org    | 2016-09-08 15:08:00.31772-06
  2 | michaeltwo | michael@realpython.org | 2016-09-08 15:08:00.320299-06
(2 rows)
```

Set up complete.

## Integration Tests

We'll be taking a test first approach to development, roughly following these steps for each endpoint:

1. Write test
1. Run the test - it should fail
1. Write code
1. Run the test - it should pass

Start by thinking about the expected input (JSON payload) and output (JSON object) for each RESTful endpoint:

| Endpoint  | HTTP   | Input       | Output           |
|-----------|--------|-------------|------------------|
| users     | GET    | none        | array of objects |
| users/:id | GET    | none        | single object    |
| users     | POST   | user object | single object    |
| users/:id | PUT    | user object | single object    |
| users/:id | DELETE | none        | single object    |

The input user object will always look something like:

```json
{
  "username": "michael",
  "email": "michael@herman.com"
}
```

Likewise, the output will always have the following structure:

```json
{
  "status": "success",
  "data": "either an array of objects or a single object"
}
```

Create a new file in the "test/integration" directory called "routes.users.test.js" and add the following code:

```javascript
process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../../src/server/app');
const knex = require('../../src/server/db/knex');

describe('routes : users', () => {

  beforeEach((done) => {
    knex.migrate.rollback()
    .then(() => {
      knex.migrate.latest()
      .then(() => {
        knex.seed.run()
        .then(() => {
          done();
        })
      });
    });
  });

  afterEach((done) => {
    knex.migrate.rollback()
    .then(() => {
      done();
    });
  });

});
```

What's happening here? Think about it on your own. Turn to Google if necessary. Still have questions? Comment below.

With that, let's start writing some code...

### GET ALL Users

Add the first test:

```javascript
describe('GET /api/v1/users', () => {
  it('should respond with all users', (done) => {
    chai.request(server)
    .get('/api/v1/users')
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      res.status.should.equal(200);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      res.body.status.should.eql('success');
      // the JSON response body should have a
      // key-value pair of {"data": [2 user objects]}
      res.body.data.length.should.eql(2);
      // the first object in the data array should
      // have the right keys
      res.body.data[0].should.include.keys(
        'id', 'username', 'email', 'created_at'
      );
      done();
    });
  });
});
```

Take note of the inline code comments. Run the test to make sure it fails. Now write the code to get the test pass, following these steps:

#### Update the route config (src/server/config/route-config.js)

```javascript
(function (routeConfig) {

  'use strict';

  routeConfig.init = function (app) {

    // *** routes *** //
    const routes = require('../routes/index');
    const userRoutes = require('../routes/users');

    // *** register routes *** //
    app.use('/', routes);
    app.use('/api/v1/users', userRoutes);

  };

})(module.exports);
```

Now we have a new set of routes set up that we can use within *src/server/routes/users.js* which we need to set up...

#### Set up new routes

Create the *users.js* file in "src/server/routes/", and then add in route boilerplate:

```javascript
const express = require('express');
const router = express.Router();

const knex = require('../db/knex');

module.exports = router;
```

Now we can add in the route handler:

```javascript
router.get('/', (req, res, next) => {
  knex('users').select('*')
  .then((users) => {
    res.status(200).json({
      status: 'success',
      data: users
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});
```

Run the tests:

```sh
$ npm test
```

You should see the test passing:

```sh
routes : users
  GET /api/v1/users
    ✓ should respond with all users
```

### GET Single User

Moving on, we can just copy and paste the previous test and use that boilerplate to write the next test:

```javascript
describe('GET /api/v1/users/:id', () => {
  it('should respond with a single user', (done) => {
    chai.request(server)
    .get('/api/v1/users/1')
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      res.status.should.equal(200);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      res.body.status.should.eql('success');
      // the JSON response body should have a
      // key-value pair of {"data": 1 user object}
      res.body.data[0].should.include.keys(
        'id', 'username', 'email', 'created_at'
      );
      done();
    });
  });
});
```

Run the test. Watch it fail. Write the code to get it to pass:

```javascript
router.get('/:id', (req, res, next) => {
  const userID = parseInt(req.params.id);
  knex('users')
  .select('*')
  .where({
    id: userID
  })
  .then((users) => {
    res.status(200).json({
      status: 'success',
      data: users
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});
```

### POST

Test:

```javascript
describe('POST /api/v1/users', () => {
  it('should respond with a success message along with a single user that was added', (done) => {
    chai.request(server)
    .post('/api/v1/users')
    .send({
      username: 'ryan',
      email: 'ryan@ryan.com'
    })
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 201 status code
      // (indicating that something was "created")
      res.status.should.equal(201);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      res.body.status.should.eql('success');
      // the JSON response body should have a
      // key-value pair of {"data": 1 user object}
      res.body.data[0].should.include.keys(
        'id', 'username', 'email', 'created_at'
      );
      done();
    });
  });
});
```

Code:

```javascript
// *** add a user *** //
router.post('/', (req, res, next) => {
  const newUsername = req.body.username;
  const newEmail = req.body.email;
  knex('users')
  .insert({
    username: newUsername,
    email: newEmail
  })
  .returning('*')
  .then((user) => {
    res.status(201).json({
      status: 'success',
      data: user
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});
```

### PUT

Test:

```javascript
describe('PUT /api/v1/users', () => {
  it('should respond with a success message along with a single user that was updated', (done) => {
    knex('users')
    .select('*')
    .then((user) => {
      const userObject = user[0];
      chai.request(server)
      .put(`/api/v1/users/${userObject.id}`)
      .send({
        username: 'updatedUser',
        email: 'updated@user.com'
      })
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        res.body.status.should.eql('success');
        // the JSON response body should have a
        // key-value pair of {"data": 1 user object}
        res.body.data[0].should.include.keys(
          'id', 'username', 'email', 'created_at'
        );
        // ensure the user was in fact updated
        var newUserObject = res.body.data[0];
        newUserObject.username.should.not.eql(userObject.username);
        newUserObject.email.should.not.eql(userObject.email);
        // redundant
        newUserObject.username.should.eql('updatedUser');
        newUserObject.email.should.eql('updated@user.com');
        done();
      });
    });
  });
});
```

Code:

```javascript
// *** update a user *** //
router.put('/:id', (req, res, next) => {
  const userID = parseInt(req.params.id);
  const updatedUsername = req.body.username;
  const updatedEmail = req.body.email;
  knex('users')
  .update({
    username: updatedUsername,
    email: updatedEmail
  })
  .where({
    id: userID
  })
  .returning('*')
  .then((user) => {
    res.status(200).json({
      status: 'success',
      data: user
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});
```

### DELETE

Test:

```javascript
describe('DELETE /api/v1/users/:id', () => {
  it('should respond with a success message along with a single user that was deleted', (done) => {
    knex('users')
    .select('*')
    .then((users) => {
      const userObject = users[0];
      const lengthBeforeDelete = users.length;
      chai.request(server)
      .delete(`/api/v1/users/${userObject.id}`)
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        res.body.status.should.eql('success');
        // the JSON response body should have a
        // key-value pair of {"data": 1 user object}
        res.body.data[0].should.include.keys(
          'id', 'username', 'email', 'created_at'
        );
        // ensure the user was in fact deleted
        knex('users').select('*')
        .then((updatedUsers) => {
          updatedUsers.length.should.eql(lengthBeforeDelete - 1);
          done();
        });
      });
    });
  });
});
```

Code:

```javascript
// *** delete a user *** //
router.delete('/:id', (req, res, next) => {
  const userID = parseInt(req.params.id);
  knex('users')
  .del()
  .where({
    id: userID
  })
  .returning('*')
  .then((user) => {
    res.status(200).json({
      status: 'success',
      data: user
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});
```

## Unit Tests

New business requirement!

Add a route to return all users created after a certain date. Let's add a helper function to eliminate unnecessary code in the route handler.

Steps:

1. Write a unit test
1. Run the tests (the unit test should fail)
1. Write the code to pass the unit test
1. Run the tests (all should pass!)

### Write a unit test

Create a new file called *controllers.users.test.js* within the "test/unit/" directory:

```javascript
process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();

const usersController = require('../../src/server/controllers/users');

describe('controllers : users', () => {

  describe('filterByYear()', () => {
    // add code here
  });

});
```

Now add the body of the test:

```javascript
const userArray = [
  {
    id: 1,
    username: 'michael',
    email: 'michael@mherman.org',
    created_at: '2016-09-10T16:44:28.015Z'
  },
  {
    id: 2,
    username: 'mike',
    email: 'mike@mherman.org',
    created_at: '2015-09-10T16:44:28.015Z'
  },
  {
    id: 3,
    username: 'mike',
    email: 'mike@mherman.org',
    created_at: '2014-09-10T16:44:28.015Z'
  }
];
it('should return all users created on or after (>=) specified year',
(done) => {
  usersController.filterByYear(userArray, 2015, (err, total) => {
    should.not.exist(err);
    total.length.should.eql(2);
    done();
  });
});
```

What's happening?

## Fixture

1. install faker
1. create a helper script
1. write the code
1. write a new test

npm install faker@3.1.0 --save-dev

## 12pm to 2pm

1. Validation
  - advanced validation w/ https://github.com/ctavan/express-validator
1. Refactoring
  - making it modular w/ https://github.com/vitaly-t/pg-promise-demo
  - move logic to controller
  - add queries file
1. Migrations
  - updating the schema
1. CI
  - Run your tests on save w/ Gulp

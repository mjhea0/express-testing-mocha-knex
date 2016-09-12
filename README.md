# Testing Node and Express

This tutorial looks at how to test an [Express](https://expressjs.com/) CRUD app with [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/). Although we'll be writing both [unit and integration tests](http://stackoverflow.com/questions/5357601/whats-the-difference-between-unit-tests-and-integration-tests), the focus will be on the latter so that the tests run against the database in order to test the full functionality of our app. Postgres will be used, but feel free to use your favorite relational database.

Let's get to it!

## Objectives

By the end of this tutorial, you will be able to...

1. Discuss the benefits of automating tests
1. Set up a project with knex.js
1. Write schema migration files with knex to create new database tables
1. Generate [database seed](https://en.wikipedia.org/wiki/Database_seeding) files with knex and apply the seeds to the database
1. Utilize the knex methods to perform the basic CRUD functions on a RESTful resource
1. Set up the testing structure with Mocha and Chai
1. Write integration tests
1. Write unit tests
1. Write tests, and then write just enough code to pass the tests
1. Create [Express routes](https://expressjs.com/en/guide/routing.html)
1. Practice test driven development
1. Create a CRUD app, following RESTful best practices
1. Generate fake test data ([test fixtures](https://en.wikipedia.org/wiki/Test_fixture)) with [faker.js](https://github.com/marak/Faker.js/)
1. Validate request parameters with [express-validator](https://github.com/ctavan/express-validator)



1. Generate a Swagger Spec based on an existing RESTful API developed with Node, Express, and Postgres
1. Set up the Swagger UI for testing and interacting with the API

## Why Test?

Are you currently manually testing your app?

When you push new code do you manually test all features in your app to ensure the new code doesn't break existing functionality? How about when you're fixing a bug? Do you manually test your app? How many times - ten, twenty, thirty?

Stop wasting time!

If you do any sort of manual testing write an automated test instead. Your future self will thank you.

Need more convincing? Testing...

1. Helps break down problems into manageable pieces
1. Forces you to write cleaner code
1. Prevents overcoding
1. Let's you sleep at night (because you *actually* know that your code works)

## Getting Started

### Project Setup

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

> **NOTE:** Add your name for the MIT License and opt not to add Gulp Notify.

Open the project in your favorite text editor, and then review the project structure as the dependencies are installed:

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

### Database Setup

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

Here, different database configuration is used based on the app's environment, either `development` or `test`. The [environment variable](https://en.wikipedia.org/wiki/Environment_variable) `NODE_ENV` is used to change the environment. `NODE_ENV` defaults to `development`, so when we run our tests, we'll need to update the variable to `test` in order to pull in the proper config.

Next, let's init the database connection. Create a new folder within "server" called "db" and then add a file called *knex.js*:

```javascript
const environment = process.env.NODE_ENV;
const config = require('../../../knexfile.js')[environment];
module.exports = require('knex')(config);
```

The database connection is established by passing the proper environment (via the environment variable `NODE_ENV`) to *knexfile.js* which returns the associated object that is passed to the `knex` library in the third line above.

> **NOTE**: Now is a great time to init a new git repo and make your first commit!

### Test Structure

With that complete, let's look at the current test structure. In the "src" directory, you'll notice a "test" directory, which as you probably guessed contains the test specs. Two sample tests have been created, plus there is some basic configuration set up for [JSHint](https://github.com/jshint/jshint) and [JSCS](http://jscs.info/) so that the code is linted against the style config and conventions defined in the *.jscsrc*  and *jshintrc* files, respectively.

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

Glance at the sample tests. Notice how we updated the environment variable at the top of each test:

```javascript
process.env.NODE_ENV = 'test';
```

Remember what this does? Scroll back up to the previous section if you forgot. Now, when we run the tests, knex is intilized with the `test` config.

### Schema Migrations

To keep the code simple, let's use one CRUD resource - `users`:

| Endpoint  | HTTP   | Result               |
|-----------|--------|----------------------|
| users     | GET    | get all users        |
| users/:id | GET    | get a single user    |
| users     | POST   | add a single user    |
| users/:id | PUT    | update a single user |
| users/:id | DELETE | delete a single user |

Init a new knex migration:

```sh
$ knex migrate:make users
```

This command created a new migration file in the "src/server/db/migrations" folder. Now we can create the table along with the individual fields:

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

We need to [seed](https://en.wikipedia.org/wiki/Database_seeding) the database to add dummy data to the database so we have something to work with. Init a new seed, which will add a new seed file to "src/server/db/seeds/":

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
1. Run the test (it should fail)
1. Write code
1. Run the test (it should pass)

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

Take note of the inline code comments. Need more explanation? Read over [Testing Node.js With Mocha and Chai](http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/#.V9W8aJMrJE4). Run the test to make sure it fails. Now write the code to get the test pass, following these steps:

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

Now we have a new set of routes set up that we can use within *src/server/routes/users.js*, which we need to add...

#### Set up new routes

Create the *users.js* file in "src/server/routes/", and then add in the route boilerplate:

```javascript
const express = require('express');
const router = express.Router();

const knex = require('../db/knex');

module.exports = router;
```

Now we can add in the route handler with the knex methods for retrieving all users from the `users` table:

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

Run all your tests. All should pass.

## Unit Tests

New business requirement!

We need a route to return all users created after a certain date. Since we already know how to write routes, let's add a helper function that takes an array of users and a year that then returns an array of users created on or after the specified date. We can then use this function in a future route handler.

Steps:

1. Write a unit test
1. Run the tests (the unit test should fail)
1. Write the code to pass the test
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

#### What's happening?

Within the `it` block we passed in the `userArray`, a year, and a callback function to a function called `filterByYear()`. This then asserts that a error does not exist and that the length of the response (`total`) is 2.

Run the tests. Watch them fail. Add the code...

### Write the code to pass the unit test

Create a new controller within "src/server/controllers" called *users.js*:

```javascript
function filterByYear(arrayOfUsers, year, callback) {
  const response = arrayOfUsers.filter((user) => {
    const date = new Date(user.created_at);
    return date.getFullYear() >= year;
  });
  callback(null, response);
}

module.exports = {
  filterByYear
};
```

Confused? Add an inline comment above each line, describing *what* the code does and, in some cases, *why* the code does what it does.

Run the tests. Do they pass? They should.

Now you can use that function in a new route to finish the business requirement. Do this on your own. Be sure to write the integration test first!

## Fixtures

[faker.js](https://github.com/marak/Faker.js/) is a powerful library for generating fake data. In our case, we can use faker to generate test data
for our unit tests. Such data is often called a [test fixture](https://en.wikipedia.org/wiki/Test_fixture).

Install faker:

```sh
npm install faker@3.1.0 --save-dev
```

### Code

Since we don't really (or maybe *really* don't?) know what the test is going to look like, let's start with writing a quick script to generate test data. Create a new file within the "test" directory called *generate.test.date.js*, and then add the following code to it:

```javascript
const faker = require('faker');

function createUserObject(
  yearOne, yearTwo, amountToCreate, callback) {
  const userArray = [];
  for (var i = 1; i <= amountToCreate; i++) {
    userArray.push({
      id: faker.random.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      created_at: faker.date.between(yearOne, yearTwo)
    });
  }
  callback(null, userArray);
}
```

This function generates an array of user objects, each object is generated randomly using faker.js [methods](https://github.com/marak/Faker.js/#api). We could use that data directly in the test, but let's first save the data to a fixture file for easy use. Update the file like so:

```javascript
const faker = require('faker');
const fs = require('fs');
const path = require('path');

function createUserObject(
  yearOne, yearTwo, amountToCreate, callback) {
  const userArray = [];
  for (var i = 1; i <= amountToCreate; i++) {
    userArray.push({
      id: faker.random.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      created_at: faker.date.between(yearOne, yearTwo)
    });
  }
  callback(null, userArray);
}

createUserObject(2010, 2014, 10, (err, beforeDates) => {
  if (!err) {
    createUserObject(2015, 2016, 5, (err, onOrAfterDates) => {
      const userArray = beforeDates.concat(onOrAfterDates);
      fs.writeFile(
        path.join(__dirname, 'test.data.json'),
        JSON.stringify(userArray, null, 2),
        (err) => {
        if (!err) {
          return true;
        }
      });
    });
  }
  return false;
});
```

Now we can generate two arrays -

1. One with data *before* a specific date
1. The other with data *on or after* that specific date

Before saving to a file, we concatenated the two arrays into one. You'll see why this was necessary when the test is created. For now, run the script from the project root:

```sh
$ node test/generate.test.data.js
```

You should see a new fixture file called *test.data.json* in the "test" folder. The data in this file can now be used in a test.

### Test

Add the following test to *controllers.users.test.js*:

```javascript
describe('filterByYear() with helper', () => {
  it('should return all users created on or after (>=) specified year',
  (done) => {
    const testDataFile = path.join(
      __dirname, '..', 'test.data.json');
    fs.readFile(testDataFile, 'utf8', (err, data) => {
      usersController.filterByYear(
        JSON.parse(data), 2015, (err, total) => {
        should.not.exist(err);
        total.length.should.eql(5);
        done();
      });
    });
  });
});
```

Make sure to require in `fs` and `path` at the top:

```javascript
const fs = require('fs');
const path = require('path');
```

Run the tests again!

## Validation

Thus far we have not tested for possible errors. For example, what happens if the email address provided with a POST request is not properly formatted? Or if an invalid ID is used with a PUT request?

We can start by validating parameters with [express-validator](https://github.com/ctavan/express-validator).

### Install

```sh
$ npm install express-validator@2.20.8 --save
```

Then `require` the module at the top of *src/server/config/main-config.js*:

```javascript
const expressValidator = require('express-validator');
```

Mount the validator to the app middleware just below the body parser:

```javascript
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
```

### Test

Add the first test to the `GET /api/v1/users/:id'` describe block:

```javascript
it('should throw an error if the user id is null', (done) => {
  chai.request(server)
  .get(`/api/v1/users/${null}`)
  .end((err, res) => {
    res.status.should.equal(400);
    res.body.message.should.eql('Validation failed');
    res.body.failures.length.should.eql(1);
    done();
  });
});
```

Add the second test to the `POST /api/v1/users` describe block:

```javascript
it('should throw an error when a username is not provided', (done) => {
  chai.request(server)
  .post('/api/v1/users')
  .send({
    username: null,
    email: '111111'
  })
  .end((err, res) => {
    res.status.should.equal(400);
    res.body.message.should.eql('Validation failed');
    res.body.failures.length.should.eql(2);
    // ensure the user was not added
    knex('users')
    .select('*')
    .where({
      email: '111111'
    })
    .then((user) => {
      user.length.should.eql(0);
      done();
    });
  });
});
```

### Code

To add the proper validation, create a new file called *validation.js* within the "routes" directory:

```javascript
function validateUserResources(req, res, next) {
  if (req.method === 'GET') {
    req.checkParams('id', 'Must be valid').notEmpty().isInt();
  } else if (req.method === 'POST') {
    req.checkBody('username', 'Username cannot be empty').notEmpty();
    req.checkBody('email', 'Must be a valid email').isEmail();
  } else if (req.method === 'PUT') {
    req.checkParams('id', 'Must be valid').notEmpty().isInt();
    req.checkBody('username', 'Username cannot be empty').notEmpty();
    req.checkBody('email', 'Must be a valid email').isEmail();
  } else if (req.method === 'DELETE') {
    req.checkParams('id', 'Must be valid').notEmpty().isInt();
  }
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({
      message: 'Validation failed',
      failures: errors
    });
  } else {
    return next();
  }
}

module.exports = validateUserResources;
```

Here, with express-validator, parameters are validated using either `req.checkParams` or `req.checkBody` and then errors are aggregated together with `req.validationErrors()`.

Require this module in the user routes:

```javascript
const userQueries = require('../db/queries.users');
```

Add the `validateUserResources` to all the route handlers except the handler to GET ALL users, like so:

```javascript
// *** GET SINGLE user *** //
router.get('/:id',
  validate.validateUserResources,
  (req, res, next) => {
    ...
  })
```

Finish the remaining route handlers, and then run the tests. All should pass:

```shell
jscs
  ✓ should pass for working directory (633ms)

routes : index
  GET /
    ✓ should render the index (71ms)
  GET /404
    ✓ should throw an error

routes : users
  GET /api/v1/users
    ✓ should respond with all users (53ms)
  GET /api/v1/users/:id
    ✓ should respond with a single user
    ✓ should throw an error if the user id is null
  POST /api/v1/users
    ✓ should respond with a success message along with a single user that was added (129ms)
    ✓ should throw an error when a username is not provided
  PUT /api/v1/users/:id
    ✓ should respond with a success message along with a single user that was updated
  DELETE /api/v1/users/:id
    ✓ should respond with a success message along with a single user that was deleted

jshint
  ✓ should pass for working directory (661ms)

controllers : index
  sum()
    ✓ should return a total
    ✓ should return an error

controllers : users
  filterByYear()
    ✓ should return all users created on or after (>=) specified year
  filterByYear() with helper
    ✓ should return all users created on or after (>=) specified year

15 passing (3s)
```

We are still not handling all errors. What else could go wrong? Think about edge cases. Then write tests. Do this on your own.

## Refactor

Finally, let's make our code a bit more modular by refactoring out unnecessary logic from the route handlers.

Within the "db" folder, add a file called *queries.users.js*:

```javascript
const knex = require('./knex');

function getAllUsers(callback) {
  return knex('users').select('*')
  .then((users) => {
    callback(null, users);
  })
  .catch((err) => {
    callback(err);
  });
}

module.exports = {
  getAllUsers
};
```

This function now handles all the knex logic, and it can now be used anywhere in the project. Be sure to update the route handler:

```javascript
// *** GET ALL users *** //
router.get('/', (req, res, next) => {
  userQueries.getAllUsers((err, users) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        data: err
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: users
      });
    }
  });
});
```

Don't forget to add the requirement:

```javascript
const userQueries = require('../db/queries.users');
```

Run the tests again. They all should still pass! Notice how we were able to refactor with confidence (without fear of the code breaking) since we had proper test coverage. Finish refactoring out all of the knex logic to *queries.users.js*. Test again when done.

## Conclusion

Turn back to the objectives. Read each aloud to yourself. Can you put each one into action?

The testing process may seem daunting and unnecessary at first, but you will soon just how necessary they are as your projects grow and become more complex. Continue to practice testing by incorporating tests whenever you begin a new project.

The full code can be found in the [express-testing-mocha-knex](https://github.com/mjhea0/express-testing-mocha-knex) repository.

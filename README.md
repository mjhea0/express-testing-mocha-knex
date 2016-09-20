# Testing Node and Express

## Want to learn how to build this project?

Check out the [blog post](http://mherman.org/blog/2016/09/12/testing-node-and-express/#.V9bWMZMrJE4).

## Want to use this project?

1. Fork/Clone
1. Install dependencies - `npm install`
1. Add a *.env* file
1. Create two local Postgres databases - `express_tdd` and `express_tdd_testing`
1. Migrate - `knex migrate:latest --env development`
1. Seed - `knex seed:run --env development`
1. Run the development server - `gulp`
1. Test - `npm test`

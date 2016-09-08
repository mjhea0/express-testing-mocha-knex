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

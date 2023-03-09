import type { Knex } from "knex";
import config from './src/config'

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: config.postgresUser,
      password: config.postgresPassword,
      database: config.postgresDb,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: config.postgresUser,
      password: config.postgresPassword,
      database: config.postgresDb,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  }
};

module.exports = knexConfig;

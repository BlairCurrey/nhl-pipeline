require('dotenv').config();

export default {
  environment: process.env.NODE_ENV || 'development',
  postgresUser: process.env.POSTGRES_USER,
  postgresPassword: process.env.POSTGRES_PASSWORD,
  postgresDb: process.env.POSTGRES_DB
}
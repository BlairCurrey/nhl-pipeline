import knex from 'knex';
import config from './config'
const knexConfig = require('../knexfile');

export default knex(knexConfig[config.environment]);

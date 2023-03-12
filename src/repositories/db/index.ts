import knex from 'knex';
import config from '../../lib/config'
const knexConfig = require('../../../knexfile');

export default knex(knexConfig[config.environment]);

import knex, { Knex } from 'knex';
import config from '../../lib/config';
const knexConfig = require('../../../knexfile');

let instance: null | Knex = null;

export default function getKnexInstance() {
  if (!instance) {
    instance = knex(knexConfig[config.environment]);
  }

  return instance;
}
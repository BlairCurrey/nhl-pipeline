import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() => {
    return knex.schema.createTable('game_stats', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.integer('game_id').notNullable();
      table.string('player_id').notNullable();
      table.string('player_name')
      table.string('team_id')
      table.string('team_name')
      table.integer('player_age');
      table.integer('player_number')
      table.string('player_postion')
      table.integer('assists');
      table.integer('goals');
      table.integer('hits');
      table.integer('points');
      table.integer('penalty_minutes');
      table.string('opponent_team_id');
      table.string('opponent_team_name');
      table.unique(['game_id', 'player_id']);
    })
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('game_stats')
}
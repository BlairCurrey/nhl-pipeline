import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('schedule', function(table) {
    table.increments('id').primary();
    table.timestamp('start_time').notNullable();
    table.integer('game_id').unsigned().notNullable();
    // table.foreign('game_id').references('id').inTable('games');
    table.timestamp('end_time').notNullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('schedule')
}


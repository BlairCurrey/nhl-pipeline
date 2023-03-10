# Local Development

## Requirements
- Docker
- yarn

## Setup
Install dependencies:
  
  yarn install

Define environment variables in an `.env`. You can just rename `.env-example` to `.env` for simplicity.

Start the database and redis:

  docker-compose up -d

Run migrations:

  yarn up

## Access Postgres Shell
Replace "nhl-pipeline-db-1" with container name as needed.

  docker exec -it nhl-pipeline-db-1 bash
  su postgres
  psql nhl

## Access Redis Shell
Replace "nhl-pipeline-redis-1" with container name as needed.

  docker exec -it nhl-pipeline-redis-1 sh
  redis-cli

Check entire queue:

  lrange live_game_ingestion_queue 0 -1


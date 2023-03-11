# Local Development

## Requirements
- Docker
- yarn

## Setup
Install dependencies:
  
  yarn install

Define environment variables in an `.env`. You can just rename `.env-example` to `.env` for simplicity.

Start the database:

  docker-compose up -d

Run migrations:

  yarn up

## Access Postgres Shell
Replace "nhl-pipeline-db-1" with container name as needed.

  docker exec -it nhl-pipeline-db-1 bash
  su postgres
  psql nhl

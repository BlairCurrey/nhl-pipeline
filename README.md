# Local Development
This was developed locally on an M1 Mac using node version 18.13.0, a docker postgres container, and yarn for package management. 

The node version is include in the `.nvmrc` file. I believe any node version >= 17.5 (when `fetch` was added) will work.

## Setup
Git clone and cd into project:

    git clone https://github.com/BlairCurrey/nhl-pipeline.git
    cd nhl-pipeline

Define environment variables in an `.env`. You can just rename `.env-example` to `.env` for simplicity. The Postgres env vars will be used to configure Postgres if using docker. If using another postgres database, you need to create an `nhl` database.

If using docker, initialize database:

    docker compose up -d

Install dependencies:
  
    yarn install

Run migrations:

    yarn up

Build and run tests:

    yarn build
    yarn test

## Running
Start the main monitor service:

    yarn start

> NOTE: This will attempt to update live games every 10 seconds between 10am and 3:59AM EST. You will need to modify the cron string to run outside of these times.

<br>
Ingest game stats for a given season (or seasons):

    yarn ingest-seasons 20212022 20222023

> NOTE: This can take around ~10 minutes for each season and spawns a new process for each game. In my experience this has not caused problems, as the processes are short-lived and there is a delay between each one. You can modifying the delay in `updateGames` or ingest 1 season at a time if this proves too intensive. You can use `ps -e | grep ingest` to monitor if desired.

<br>
Start the api:

    yarn api

Get the game stats (akin to box score) for a given game id:

    curl localhost:8080/game-stats/2022010001

## Accessign Postgres Shell in Docker Container
Replace "nhl-pipeline-db-1" with container name as needed.

    docker exec -it nhl-pipeline-db-1 bash
    su postgres
    psql nhl

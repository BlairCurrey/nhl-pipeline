# Overview

I developed this over several days. It was not a linear process. I started by thinking through the required components and designing something on paper but iterated a few times while I was building it as I was not satisfied with how it addressed the problem. I will describe this progression of ideas, detail and critique the current implementation, and explore some of the tradeoffs.

While this was developed locally I did so with the ideal of a serverless deployment in mind.

## Main Components
This will serve as a quick, high-level description of what each component is. For the _why_, please see the exposition in the `Progression of the Pipeline` section. For context on running, see the README.md

### monitor
Stateless service that gets the schedule at a defined interval and spawns an ingest process for each live game. Also includes functionality for getting entire seasons.

### ingest
Stateless service that gets the latest game stats, parses it and saves it in the `game_stats` database table before closing.

### api
Express server exposing the game-stats resource over http. Contains `/game-stats` and `/game-stats/:id` (where `id` is a game id aka `gamePk`) endpoints. `/game-stats` currently doesn't have any pagination so it might not work correctly when there is a large volume of records.

## Progression of the Pipeline

The main problems I ran into with this challenge were how to determine when to poll for the schedule and how to determine if we should spawn a process or not. My initial ideas were guided by my instinct to poll for the schedule as little as possible and to track the state of games/processes and spawn based on that. Eventually, I became less sure that over-polling would be expensive and opted for a solution that I think is much simpler and more fault tolerant, but polls for the schedule very frequently. A deeper investigation of the costs (specifically, incoming network traffic) is needed before I can be more confident in my solution or decide to pursue alternatives.

### Where I started
My first idea was to gather the day's schedule early in the day (shortly after midnight) in a `monitor` process and schedule an `ingest` process to spawn shortly before the start time. However, I noticed a few problems with this. First, the start time might change. Whether it's delayed (more likely) or advanced (probably unlikely, but can we completely rule it out?), we can't just rely on the initial schedule. This made me consider some sort of reverse exponential backoff algorithm where we update the schedule progressively more frequently as we get close to the scheduled time. 

Ultimately a reverse backoff might work well but I decided to take a simpler route because I wasn't sure that it would save much in real costs and seemed a bit complicated. I decided to poll more frequently (every minute) for the schedule between in-season hours (10am-3:59am between September and May) and save/update games in the database. This schedule could probably use tweaking. For example, the NHL api includes the olympics and other events which may fall out of this range (although this requirement should be clarified). After saving/updating the games I would compare the status of the games we polled against their previous status and start an `ingest` process if it changed to live. The `ingest` processes would run continuously using `setInterval` until it was final and exited. This was my first implementation.

With this implementation, I struggled to ensure the robustness of the database state and processes. Under normal circumstances, they worked as intended, but I kept finding new situations where I had to adjust the logic for spawning processes that considered the range of side effects of the previous run. What if the `ingest` process dies, two monitor `processes` are run at once, or the database connection fails? I was just assuming that if a process was spawned before that a new process didn't need to be spawned. I tried to think of ways around this (such as mark as completed before killing `ingest` process) but all of these ideas seemed brittle too. At this point, I tried to utilize this code to also ingest past seasons and found it very difficult to extend. I decided this stateful `monitor` services was rather complicated and brittle. 

### Where I ended up

After taking a break for a while I wondered if I could make the monitor and ingestion components stateless. I decided that I could simply poll the schedule and spawn a process for every live game -- that's it. This requires two major changes. 1) The ingestion process makes 1 api call, upserts, and closes instead of staying open and polling. 2) The monitor process needs to poll as frequently as the games need to be ingested (more on that later).

In addition to removing the dependency on state and improving fault tolerance, it eliminated the following resources consumption:
  - all db reads/writes in monitor
  - execution time on ingest process (because we're not sitting and watching)

And added the constraint that the `monitor` run as frequently as `ingest`, which added the following resource consumption:
  - execution time on monitor process (every 10 seconds instead of every 60 seconds)
  - 6x more requests for schedule (each @ 4kb json size)

#### Critique
It's great that `monitor` does not depend on some highly orchestrated state but I don't like that its update interval is coupled with the ingestion update interval (and thus, that it's so frequent). It's important to consider that this will ultimately cost as well.

I did some back-of-the-envolope math on the execution time of `monitor` and `ingest` using AWS lambda pricing. I'm not sure about the results. They are my best guess. But what I found is that execution time is too low to worry about for any of the methods described above (< $1/month). My impression is network traffic from outside of AWS services (like the NHL api) would be relatively expensive whereas network traffic within AWS services would be cheaper, although I'm not sure how expensive it would be in absolute terms. I had a harder time tracking that. I'm not sure if polling the schedule every 10 seconds would be prohibitively expensive. I included this math at the bottom of the document for reference (it's a bit messy but gives some insight into what's forming these).

I am not sure if the costs associated with increased schedule polling are prohibitive or not but it lead me to think about the following variation:
  - monitor schedule intelligently. poll nhl schedule with increasing frequence as we get closer to a game and update the schedule in the database. dont start any processes.
    - this reduces costs related to outside network traffic and adds costs for writing to db
  - new worker service continuously polls our database for schedule. This decouples our ingest update interval from our schedule poll interval.
    - adds an extra reads cost
  - ingest stays the same. it just fires 1 api call and upserts

### Back of the Envolope Math
back-of-envolope math for execution time with my current implementation:
monthly aws lambda costs for ingests:
  - 256 MB RAM:
    - live feed response is about 475KB (largest of a few responses I sampled. /Users/blair/code/stuff/nhl-pipeline/src/test/responses/live_20230310_163915.json)
    - node runs fine on less: https://stackoverflow.com/questions/9613528/node-js-with-v8-suitable-for-limited-memory-device
  - request/month:
    - $0.04/month https://dashbird.io/lambda-cost-calculator/
    - $0.005 637200 * 0.0000000083 https://aws.amazon.com/lambda/pricing/
      - 236 games/month (took from march, busiest i think)
      - 900 executions per game. if each game is 2.5 hours, thats 9000 seconds. at a rate of 1 execution per 10 seconds thats 900 executions per game
      - 212400 executions per month = 900 * 236
      - 3 seconds per execution
      - 637200 of execution time per month
    - = $0.04/month
monthly aws lambda costs for monitor:
  - $0.57/month https://dashbird.io/lambda-cost-calculator/
  - 256 MB RAM
  - 2,678,400 (86400 x 31) executions per month
    - 86400 (10 * 6 * 60 * 24) executions per day * 31 days
  - 3 seconds per execution
  - or, may need constant execution to support 10/second "cron" job, system level cron does not support seconds
    - ideas for running a lambda every 10 seconds (step functions?):
      - https://zaccharles.medium.com/another-way-to-trigger-a-lambda-function-every-5-10-seconds-41cb5bc3fa80
      - https://stackoverflow.com/questions/47630397/invoking-a-lambda-function-every-5-seconds

inbound traffic for monthly ingestion traffic (applies to all my approaches):
  - cost ??? hard time finding the right information on this
  - 1.2/TB month ceiling for ingest
    - monthyl requests * max size of live feed json
    - max json size is when game is over. guessing it would actually be closer to 0.8TB/month

inbound traffic for schedule for current implementation:
  - cost ??? hard time finding the right information on this
  - schedule response size: 4kb
  - schedules requested/day = 6480  (360 fetches/hour, runs for 18 hours)
  - traffic/day = ~26Mb = 4kb * 6480 =
  - traffic/month = 806Mb = ~26Mb * 31


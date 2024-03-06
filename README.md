# TTRPG Scheduler

## Getting Started

* Install yarn (`npm i yarn -g`)
* Install PostgreSQL (https://www.postgresql.org/download/)
* Install NestJS globally `yarn global add @nestjs/cli`
* Run `yarn install`
* Run `yarn db:init` (only run once)
* Run `yarn db:up` (run any time a new migration or model change is made)
* Run `yarn start`!



## Roadmap

 * Add Invite links

## Known issues
 * Schedule exceptions do not respect the selected week and always appear. (this will also cause issues with dates wrapping over but that should never happen with the UI as designed, but could happen with bad data or future calendar integration or manual exception data input)
 * Schedule exceptions do not shift when changing user timezone (should they? Weekly availabilities do, but maybe they shouldn't? Use case of a campaign that is at a specific time, but the user moves to a different timezone)

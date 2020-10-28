# <%= appName %>

_An application running with [Kuzzle](https://github.com/kuzzleio/kuzzle)_

## Installation and run

Requirement: 
 - Node.js >= 12
 - NPM >= 6
 - Docker
 - Docker-Compose

First, install [Kourou](https://github.com/kuzzleio/kourou), the Kuzzle CLI: `npm install -g kourou`

Then you need to start the services used by Kuzzle, Elasticsearch and Redis. You can run those services in the background with the following command: `kourou app:start-services`

Finally you can start your application with `kourou app:run`.  

Under the hood this command simply run Node.js with Typescript as following: `node -r ts-node/register app.ts`

import { Backend } from 'kuzzle'

const appName = require('./package.json').name;

const app = new Backend(appName);

app.start()
  .then(() => {
    app.log.info(`Application ${appName} started`);
  })
  .catch(console.error);
import { Backend } from 'kuzzle'

const app = new Backend('<%= appName %>');

app.start()
  .then(() => {
    app.log.info('Application started');
  })
  .catch(console.error);
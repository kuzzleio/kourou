const
  {
    Given
  } = require('cucumber');

Given('I\'m logged in Kuzzle as user {string} with password {string}', function (username, password) {
  return this.sdk.auth.login('local', { username, password });
});

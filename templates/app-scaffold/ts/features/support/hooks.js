'use strict';

const _ = require('lodash');
const { After, Before, BeforeAll } = require('cucumber');
const { Kuzzle, WebSocket } = require('kuzzle-sdk');

const defaultMappings = require('../fixtures/mappings');
const defaultFixtures = require('../fixtures/fixtures');
const defaultRights = require('../fixtures/rights');

const World = require('./world');

BeforeAll({ timeout: 30 * 1000 }, async function () {
  const world = new World({});

  if (world.port.toString() === '443') {
    throw new Error(`Detecting tests on port 443. Are you targeting a production server? (${world.host})`)
  }

  world.sdk = new Kuzzle(
    new WebSocket(world.host, { port: world.port })
  );

  console.log(`Connecting to Kuzzle at ${world.host}:${world.port}..`);

  await world.sdk.connect();

  await world.sdk.query({
    controller: 'admin',
    action: 'loadSecurities',
    body: defaultRights,
    refresh: 'wait_for',
    onExistingUsers: 'overwrite',
  });

  await world.sdk.query({
    controller: 'admin',
    action: 'loadMappings',
    body: defaultMappings,
    refresh: 'wait_for'
  });

  world.sdk.disconnect();
});

Before({ timeout: 30 * 1000 }, async function () {
  this.props.now = Date.now();
  this.props.i = 1;

  this.sdk = new Kuzzle(
    new WebSocket(this.host, { port: this.port })
  );

  await this.sdk.connect();

  await this.sdk.query({
    controller: 'admin',
    action: 'loadFixtures',
    body: defaultFixtures,
    refresh: 'wait_for'
  });
});

After(async function () {
  // Clean values stored by the scenario
  this.props = {};

  if (this.sdk && typeof this.sdk.disconnect === 'function') {
    this.sdk.disconnect();
  }
});

// security hooks ==============================================================

After({ tags: '@security', timeout: 60 * 1000 }, async function () {
  await resetSecurityDefault(this.sdk);
});

async function resetSecurityDefault(sdk) {
  await sdk.query({
    controller: 'admin',
    action: 'resetSecurity',
    refresh: 'wait_for'
  });

  sdk.jwt = null;

  await sdk.query({
    controller: 'admin',
    action: 'loadSecurities',
    body: defaultRights,
    refresh: 'wait_for',
    onExistingUsers: 'overwrite',
  });
}

// realtime hooks ==============================================================

After({ tags: '@realtime' }, function () {
  if (_.isEmpty(this.props.subscriptions)) {
    throw new Error('@realtime time has been set but no subscriptions have been made.');
  }

  const promises = Object.values(this.props.subscriptions)
    .map(({ unsubscribe }) => unsubscribe());

  return Promise.all(promises);
});

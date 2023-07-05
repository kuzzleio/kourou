
'use strict';

const { Before, AfterAll } = require('cucumber');
const { JestConverter } = require('./JestConverter');

global.converter = new JestConverter();

AfterAll({ timeout: 30 * 1000 }, async function () {
  global.converter.writeScenarioEnd();
  global.converter.writeFileEnd();
});

Before({ timeout: 30 * 1000 }, async function (scenario) {
  global.converter.hookBefore(
    scenario.sourceLocation.uri,
    scenario.pickle.name,
    scenario.pickle.tags.map(({ name }) => name));
});

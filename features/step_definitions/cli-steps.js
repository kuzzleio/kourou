const
  _ = require('lodash'),
  fs = require('fs'),
  execa = require('execa'),
  {
    Then
  } = require('cucumber');

Then('I run the command {string} with flags:', async function (command, dataTable) {
  const flagsObject = this.parseObject(dataTable);

  const flags = [];

  for (const [arg, value] of Object.entries(flagsObject)) {
    flags.push(arg);
    flags.push(value);
  }

  const { stdout } = await execa('./bin/run', [...command.split(' '), ...flags])

  this.props.result = stdout;
});

Then('I run the command {string} with args:', async function (command, dataTable) {
  const args = [];

  for (const row of dataTable.rawTable) {
    args.push(JSON.parse(row[0]));
  }

  const { stdout } = await execa('./bin/run', [command, ...args])

  this.props.result = stdout;
});

Then(/I should( not)? match stdout with "(.*?)"/, function (not, rawRegexp) {
  const regexp = new RegExp(rawRegexp);

  if (not) {
    should(this.props.result).not.match(regexp);
  }
  else {
    should(this.props.result).match(regexp);
  }
});

Then('a JSON file {string} containing:', function (filename, dataTable) {
  const
    content = {},
    contentRaw = this.parseObject(dataTable);

  for (const [path, value] of Object.entries(contentRaw)) {
    _.set(content, path, value);
  }

  fs.writeFileSync(filename, JSON.stringify(content, null, 2));
});
const
  execa = require('execa'),
  {
    Then
  } = require('cucumber');

Then('I run the command {string} with:', async function (command, dataTable) {
  const argsObject = this.parseObject(dataTable);

  const args = [];

  for (const [arg, value] of Object.entries(argsObject)) {
    args.push(arg);
    args.push(value);
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
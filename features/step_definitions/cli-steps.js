const _ = require('lodash');
const fs = require('fs');
const { Then } = require('cucumber');
const { spawn } = require('child_process');

function execute(command, args) {
  const childProcess = spawn(command, args);
  let stdout = '';
  let stderr = '';

  childProcess.stdout.on('data', data => {
    stdout += data.toString();
  });

  childProcess.stderr.on('data', data => {
    stderr += data.toString()
  });

  return new Promise((resolve, reject) => {
    childProcess.on('close', code => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      }
      else {
        reject({ code, stdout, stderr, command: [command, ...args].join(' ') });
      }
    });
  });
}

Then('I run the command {string} with:', async function (command, dataTable) {
  const args = [];
  const flags = [];

  for (const columns of dataTable.rawTable) {
    const type = columns[0];

    if (type === 'arg') {
      args.push(columns[1]);
    }
    else {
      flags.push(columns[1]);

      // Could be boolean flag
      if (columns[2]) {
        flags.push(columns[2]);
      }
    }
  }

  try {
    const { stdout } = await execute('./bin/run', [...command.split(' '), ...args, ...flags])

    this.props.result = stdout;
  }
  catch (error) {
    console.error(error)

    throw error;
  }
});

Then('I run the command {string} with flags:', async function (command, dataTable) {
  const flagsObject = this.parseObject(dataTable);

  const flags = [];

  for (const [arg, value] of Object.entries(flagsObject)) {
    flags.push(arg);
    flags.push(value);
  }

  try {
    const { stdout } = await execute('./bin/run', [...command.split(' '), ...flags])

    this.props.result = stdout;
  }
  catch (error) {
    console.error(error)

    throw error;
  }
});

Then('I run the command {string} with args:', async function (command, dataTable) {
  const args = [];

  for (const row of dataTable.rawTable) {
    args.push(JSON.parse(row[0]));
  }

  try {
    const { stdout } = await execute('./bin/run', [command, ...args])

    this.props.result = stdout;
  }
  catch (error) {
    console.error(error)

    throw error;
  }
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
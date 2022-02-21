# kourou

The CLI that helps you manage your Kuzzle instances.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kourou.svg)](https://npmjs.org/package/kourou)
[![Downloads/week](https://img.shields.io/npm/dw/kourou.svg)](https://npmjs.org/package/kourou)
[![License](https://img.shields.io/npm/l/kourou.svg)](https://github.com/kuzzleio/kourou/blob/master/package.json)

<!-- toc -->
* [kourou](#kourou)
* [Usage](#usage)
* [Commands](#commands)
* [Where does this weird name come from?](#where-does-this-weird-name-come-from)
* [Have fun with a quine](#have-fun-with-a-quine)
* [Analytics](#analytics)
<!-- tocstop -->

:warning: This project is currently in beta and breaking changes may occur until the 1.0.0

# Usage

<!-- usage -->
```sh-session
$ npm install -g kourou
$ kourou COMMAND
running command...
$ kourou (-v|--version|version)
kourou/0.20.1 linux-x64 node-v14.17.0
$ kourou --help [COMMAND]
USAGE
  $ kourou COMMAND
...
```
<!-- usagestop -->

## Connect and authenticate to Kuzzle API

Commands that needs to send requests to Kuzzle API can specify the Kuzzle server address and authentication informations.

By command line:
```

  --host=host                    [default: localhost] Kuzzle server host
  --port=port                    [default: 7512] Kuzzle server port
  --username=username            [default: anonymous] Kuzzle user
  --password=password            Kuzzle user password
  --api-key=api-key              Kuzzle user api-key
  --ssl                          [default: true for port 443] Use SSL to connect to Kuzzle
  --protocol                     [default: ws] Protocol used to connect to Kuzzle ( `http` or `ws` )

```

By environment variables:
```

  KUZZLE_HOST                [default: localhost] Kuzzle server host
  KUZZLE_PORT                [default: 7512] Kuzzle server port
  KUZZLE_USERNAME            [default: anonymous] Kuzzle user
  KUZZLE_PASSWORD            Kuzzle user password
  KUZZLE_API_KEY             Kuzzle user api-key
  KUZZLE_SSL                 Use SSL to connect to Kuzzle
  KUZZLE_PROTOCOL            Protocol used to connect to Kuzzle ( `http` or `ws` )

```

## User impersonation

You can impersonate a user before executing a command with the `--as` flag and a user `kuid` .

User impersonation require the following rights for the authenticated user: `security:createApiKey` , `security:deleteApiKey`
```bash
$ kourou sdk:query auth:getCurrentUser --as gordon --username admin --password admin

 🚀 Kourou - Executes an API query.

 [ℹ] Connecting to http://localhost:7512 ...
 [ℹ] Impersonate user "gordon"

[...]
```

## Automatic command infering for API actions

When no command is found, Kourou will try to execute the given command with the `sdk:query` command.

The first argument has to be the name of the controller and the action separated by a semicolon (eg `document:create` )

Kourou will try to infer common arguments like `index` , `collection` , `_id` or `body` .

It will automatically infer and accept the following lists of arguments:
 - `<command> <index>`
    - _eg: `kourou collection:list iot` _

.

 - `<command> <body>`
    - _eg: `kourou security:createUser '{"content":{"profileIds":["default"]}}' --id yagmur` _

.

 - `<command> <index> <collection>`
    - _eg: `kourou collection:truncate iot sensors` _

.

 - `<command> <index> <collection> <body>`
    - _eg: `kourou bulk:import iot sensors '{bulkData: []}'` _

.

 - `<command> <index> <collection> <id>`
    - _eg: `kourou document:delete iot sensors sigfox-123` _

.

 - `<command> <index> <collection> <id> <body>`
    - _eg: `kourou document:create iot sensors sigfox-123 '{temperature: 42}'` _

All other arguments and options will be passed as-is to the `sdk:query` method.

> Note: you can pass arguments to the API actions with the `--arg` or `-a` option in your command, e.g.
> `kourou security:createFirstAdmin '{ ...credentials here... }' -a reset=true`

# Commands

<!-- commands -->
* [`kourou autocomplete [SHELL]`](#kourou-autocomplete-shell)
* [`kourou help [COMMAND]`](#kourou-help-command)

## `kourou autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ kourou autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ kourou autocomplete
  $ kourou autocomplete bash
  $ kourou autocomplete zsh
  $ kourou autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.3.0/src/commands/autocomplete/index.ts)_

## `kourou help [COMMAND]`

display help for kourou

```
USAGE
  $ kourou help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->

# Where does this weird name come from?

We liked the idea that this CLI is like a launchpad for the Kuzzle rocket. The place where you launch and pilot your Kuzzle instance. The place where the European Space Agency launches their rockets is in the country near the city of [Kourou](https://www.wikiwand.com/en/Kourou), in French Guiana, so we liked the idea that the Kuzzle rockets would take off from there.

# Have fun with a quine

[Quine](https://en.wikipedia.org/wiki/Quine_(computing)) are programs able to print their own source code.

```bash
$ kourou sdk:execute --print-raw '(
  function quine() {
    const quote = String.fromCharCode(39);
    const lparen = String.fromCharCode(40);
    const rparen = String.fromCharCode(41);

    console.log("kourou sdk:execute --print-raw " + quote + lparen + quine.toString() + rparen + lparen + rparen + ";" + quote)
  }
)()'
```

(Kuzzle must be accessible and running in local)

# Analytics

We use a custom Open Source analytics backend (you can check the code [here](https://gihtub.com/kuzzleio/kepler)) to record the use of Kourou by users. 
Collected metrics will allow us to study the use of our products in order to improve them. We do not collect any personal data about users.
You can disable usage metrics collection by setting the `KOUROU_USAGE` environment variable to `false`.

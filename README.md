kuzzle-houston
==============

Manage and pilot your Kuzzle instances

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kuzzle-houston.svg)](https://npmjs.org/package/kuzzle-houston)
[![Downloads/week](https://img.shields.io/npm/dw/kuzzle-houston.svg)](https://npmjs.org/package/kuzzle-houston)
[![License](https://img.shields.io/npm/l/kuzzle-houston.svg)](https://github.com/xbill82/kuzzle-houston/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g kuzzle-houston
$ kuzzle COMMAND
running command...
$ kuzzle (-v|--version|version)
kuzzle-houston/0.0.0 linux-x64 node-v10.12.0
$ kuzzle --help [COMMAND]
USAGE
  $ kuzzle COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`kuzzle document:get ID`](#kuzzle-documentget-id)
* [`kuzzle hello [FILE]`](#kuzzle-hello-file)
* [`kuzzle help [COMMAND]`](#kuzzle-help-command)
* [`kuzzle instance:spawn [FILE]`](#kuzzle-instancespawn-file)

## `kuzzle document:get ID`

Gets a document from Kuzzle

```
USAGE
  $ kuzzle document:get ID

OPTIONS
  -h, --help               show CLI help
  --collection=collection  The collection of the document
  --index=index            The index of the document
```

_See code: [src/commands/document/get.ts](https://github.com/kuzzleio/kuzzle-houston/blob/v0.0.0/src/commands/document/get.ts)_

## `kuzzle hello [FILE]`

describe the command here

```
USAGE
  $ kuzzle hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ kuzzle hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/kuzzleio/kuzzle-houston/blob/v0.0.0/src/commands/hello.ts)_

## `kuzzle help [COMMAND]`

display help for kuzzle

```
USAGE
  $ kuzzle help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.2/src/commands/help.ts)_

## `kuzzle instance:spawn [FILE]`

describe the command here

```
USAGE
  $ kuzzle instance:spawn [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/instance/spawn.ts](https://github.com/kuzzleio/kuzzle-houston/blob/v0.0.0/src/commands/instance/spawn.ts)_
<!-- commandsstop -->

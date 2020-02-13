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
* [Where does this weird name comes from?](#where-does-this-weird-name-comes-from)
<!-- tocstop -->

:warning: This project is currently in beta and breaking changes may occur until the 1.0.0

# Usage

<!-- usage -->
```sh-session
$ npm install -g kourou
$ kourou COMMAND
running command...
$ kourou (-v|--version|version)
kourou/0.8.0 linux-x64 node-v12.16.0
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
  -h, --host=host                [default: localhost] Kuzzle server host
  -p, --port=port                [default: 7512] Kuzzle server port
  --username=username            [default: anonymous] Kuzzle user
  --password=password            Kuzzle user password
  --ssl                          [default: true for port 443] Use SSL to connect to Kuzzle
```

By environment variables:
```
  KUZZLE_HOST                [default: localhost] Kuzzle server host
  KUZZLE_PORT                [default: 7512] Kuzzle server port
  KUZZLE_USERNAME            [default: anonymous] Kuzzle user
  KUZZLE_PASSWORD            Kuzzle user password
  KUZZLE_SSL                 Use SSL to connect to Kuzzle
```

# Commands

<!-- commands -->
* [`kourou api-key:create USER`](#kourou-api-keycreate-user)
* [`kourou api-key:delete USER`](#kourou-api-keydelete-user)
* [`kourou api-key:search USER`](#kourou-api-keysearch-user)
* [`kourou collection:dump INDEX COLLECTION`](#kourou-collectiondump-index-collection)
* [`kourou collection:restore PATH`](#kourou-collectionrestore-path)
* [`kourou document:get INDEX COLLECTION ID`](#kourou-documentget-index-collection-id)
* [`kourou help [COMMAND]`](#kourou-help-command)
* [`kourou index:dump INDEX`](#kourou-indexdump-index)
* [`kourou index:restore PATH`](#kourou-indexrestore-path)
* [`kourou instance:logs`](#kourou-instancelogs)
* [`kourou instance:spawn`](#kourou-instancespawn)
* [`kourou query CONTROLLER:ACTION`](#kourou-query-controlleraction)
* [`kourou vault:add SECRETS-FILE KEY VALUE`](#kourou-vaultadd-secrets-file-key-value)
* [`kourou vault:encrypt FILE`](#kourou-vaultencrypt-file)
* [`kourou vault:show SECRETS-FILE KEY`](#kourou-vaultshow-secrets-file-key)

## `kourou api-key:create USER`

Creates a new API Key for an user

```
USAGE
  $ kourou api-key:create USER

ARGUMENTS
  USER  User kuid

OPTIONS
  -d, --description=description  (required) API Key description
  -h, --host=host                [default: localhost] Kuzzle server host
  -p, --port=port                [default: 7512] Kuzzle server port
  --expire=expire                [default: -1] API Key validity
  --help                         show CLI help
  --id=id                        API Key unique ID
  --password=password            Kuzzle user password
  --ssl                          Use SSL to connect to Kuzzle
  --username=username            [default: anonymous] Kuzzle user
```

_See code: [src/commands/api-key/create.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/api-key/create.ts)_

## `kourou api-key:delete USER`

Deletes a new API Key for an user

```
USAGE
  $ kourou api-key:delete USER

ARGUMENTS
  USER  User kuid

OPTIONS
  -h, --host=host      [default: localhost] Kuzzle server host
  -p, --port=port      [default: 7512] Kuzzle server port
  --help               show CLI help
  --id=id              API Key unique ID
  --password=password  Kuzzle user password
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle user
```

_See code: [src/commands/api-key/delete.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/api-key/delete.ts)_

## `kourou api-key:search USER`

List an user API Keys

```
USAGE
  $ kourou api-key:search USER

ARGUMENTS
  USER  User kuid

OPTIONS
  -h, --host=host      [default: localhost] Kuzzle server host
  -p, --port=port      [default: 7512] Kuzzle server port
  --filter=filter      Filter to match the API Key descriptions
  --help               show CLI help
  --password=password  Kuzzle user password
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle user
```

_See code: [src/commands/api-key/search.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/api-key/search.ts)_

## `kourou collection:dump INDEX COLLECTION`

Dump an entire collection content (JSONL format)

```
USAGE
  $ kourou collection:dump INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 5000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --path=path              Dump directory (default: index name)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle user
```

_See code: [src/commands/collection/dump.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/collection/dump.ts)_

## `kourou collection:restore PATH`

Restore the content of a previously dumped collection

```
USAGE
  $ kourou collection:restore PATH

ARGUMENTS
  PATH  Dump file path

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 5000] Maximum batch size (see limits.documentsFetchCount config)
  --collection=collection  If set, override the collection destination name
  --help                   show CLI help
  --index=index            If set, override the index destination name
  --password=password      Kuzzle user password
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle user
```

_See code: [src/commands/collection/restore.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/collection/restore.ts)_

## `kourou document:get INDEX COLLECTION ID`

Get a document

```
USAGE
  $ kourou document:get INDEX COLLECTION ID

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  ID          Document ID

OPTIONS
  -h, --host=host      [default: localhost] Kuzzle server host
  -p, --port=port      [default: 7512] Kuzzle server port
  --help               show CLI help
  --password=password  Kuzzle user password
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle user
```

_See code: [src/commands/document/get.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/document/get.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `kourou index:dump INDEX`

Dump an entire index content (JSONL format)

```
USAGE
  $ kourou index:dump INDEX

ARGUMENTS
  INDEX  Index name

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 5000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --path=path              Dump directory (default: index name)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle user
```

_See code: [src/commands/index/dump.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/index/dump.ts)_

## `kourou index:restore PATH`

Restore the content of a previously dumped index

```
USAGE
  $ kourou index:restore PATH

ARGUMENTS
  PATH  Dump directory or file

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 5000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --index=index            If set, override the index destination name
  --password=password      Kuzzle user password
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle user
```

_See code: [src/commands/index/restore.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/index/restore.ts)_

## `kourou instance:logs`

```
USAGE
  $ kourou instance:logs

OPTIONS
  -f, --follow             Follow log output
  -i, --instance=instance  Kuzzle instance name
```

_See code: [src/commands/instance/logs.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/instance/logs.ts)_

## `kourou instance:spawn`

Spawn a new Kuzzle instance

```
USAGE
  $ kourou instance:spawn

OPTIONS
  -v, --version=version  [default: 2] Core-version of the instance to spawn
  --check                Check prerequisite before running Kuzzle
  --help                 show CLI help
```

_See code: [src/commands/instance/spawn.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/instance/spawn.ts)_

## `kourou query CONTROLLER:ACTION`

Executes an API query

```
USAGE
  $ kourou query CONTROLLER:ACTION

ARGUMENTS
  CONTROLLER:ACTION  Controller and action (eg: "server:now")

OPTIONS
  -h, --host=host      [default: localhost] Kuzzle server host
  -p, --port=port      [default: 7512] Kuzzle server port
  --arg=arg            Additional argument. Could be many. (eg: "--arg refresh:wait_for")
  --body=body          Request body in JSON format.
  --help               show CLI help
  --password=password  Kuzzle user password
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle user
```

_See code: [src/commands/query.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/query.ts)_

## `kourou vault:add SECRETS-FILE KEY VALUE`

Add an encrypted key to a secrets file

```
USAGE
  $ kourou vault:add SECRETS-FILE KEY VALUE

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file
  KEY           Path to the key (lodash style)
  VALUE         Value to encrypt

OPTIONS
  --vault-key=vault-key  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)
```

_See code: [src/commands/vault/add.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/vault/add.ts)_

## `kourou vault:encrypt FILE`

Encrypt an entire file

```
USAGE
  $ kourou vault:encrypt FILE

ARGUMENTS
  FILE  File containing unencrypted secrets

OPTIONS
  -f, --force                    Overwrite the output file if it already exists
  -o, --output-file=output-file  Output file (default: <file>.enc.json)
  --vault-key=vault-key          Kuzzle Vault Key (or KUZZLE_VAULT_KEY)
```

_See code: [src/commands/vault/encrypt.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/vault/encrypt.ts)_

## `kourou vault:show SECRETS-FILE KEY`

Display an encrypted key on stdout

```
USAGE
  $ kourou vault:show SECRETS-FILE KEY

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file
  KEY           Path to the key (lodash style)

OPTIONS
  --vault-key=vault-key  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)
```

_See code: [src/commands/vault/show.ts](https://github.com/kuzzleio/kourou/blob/v0.8.0/src/commands/vault/show.ts)_
<!-- commandsstop -->

# Where does this weird name comes from?

We liked the idea that this CLI is like a launchpad for the Kuzzle rocket. The place where you launch and pilot your Kuzzle instance. The place where the European Space Agency launches their rockets is in the country near the city of [Kourou](https://www.wikiwand.com/en/Kourou), in French Guiana, so we liked the idea that the Kuzzle rockets would take off from there.

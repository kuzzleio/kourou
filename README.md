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
kourou/0.7.0 linux-x64 node-v12.16.0
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
* [`kourou document:create INDEX COLLECTION`](#kourou-documentcreate-index-collection)
* [`kourou document:get INDEX COLLECTION ID`](#kourou-documentget-index-collection-id)
* [`kourou es:get INDEX ID`](#kourou-esget-index-id)
* [`kourou es:insert INDEX`](#kourou-esinsert-index)
* [`kourou es:list-index`](#kourou-eslist-index)
* [`kourou help [COMMAND]`](#kourou-help-command)
* [`kourou index:dump INDEX`](#kourou-indexdump-index)
* [`kourou index:restore PATH`](#kourou-indexrestore-path)
* [`kourou instance:logs`](#kourou-instancelogs)
* [`kourou instance:spawn`](#kourou-instancespawn)
* [`kourou profile:dump`](#kourou-profiledump)
* [`kourou profile:restore PATH`](#kourou-profilerestore-path)
* [`kourou query CONTROLLER:ACTION`](#kourou-query-controlleraction)
* [`kourou role:dump`](#kourou-roledump)
* [`kourou role:restore PATH`](#kourou-rolerestore-path)
* [`kourou vault:add SECRETS-FILE KEY VALUE`](#kourou-vaultadd-secrets-file-key-value)
* [`kourou vault:encrypt FILE`](#kourou-vaultencrypt-file)
* [`kourou vault:show SECRETS-FILE KEY`](#kourou-vaultshow-secrets-file-key)

## `kourou api-key:create USER`

Creates a new API Key for a user

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
  --username=username            [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/api-key/create.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/api-key/create.ts)_

## `kourou api-key:delete USER`

Deletes an API key.

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
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/api-key/delete.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/api-key/delete.ts)_

## `kourou api-key:search USER`

Lists a user's API Keys.

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
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/api-key/search.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/api-key/search.ts)_

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
  --batch-size=batch-size  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --path=path              Dump root directory (default: index name)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/collection/dump.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/collection/dump.ts)_

## `kourou collection:restore PATH`

Restore the content of a previously dumped collection

```
USAGE
  $ kourou collection:restore PATH

ARGUMENTS
  PATH  Dump directory path

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --collection=collection  If set, override the collection destination name
  --help                   show CLI help
  --index=index            If set, override the index destination name
  --no-mappings            Skip collection mappings
  --password=password      Kuzzle user password
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/collection/restore.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/collection/restore.ts)_

## `kourou document:create INDEX COLLECTION`

Creates a document

```
USAGE
  $ kourou document:create INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  -h, --host=host      [default: localhost] Kuzzle server host
  -p, --port=port      [default: 7512] Kuzzle server port
  --body=body          (required) Document body in JSON format
  --help               show CLI help
  --id=id              Optional document ID
  --password=password  Kuzzle user password
  --replace            Replaces the document if it already exists
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/document/create.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/document/create.ts)_

## `kourou document:get INDEX COLLECTION ID`

Gets a document

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
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/document/get.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/document/get.ts)_

## `kourou es:get INDEX ID`

Gets a document from ES

```
USAGE
  $ kourou es:get INDEX ID

ARGUMENTS
  INDEX  ES Index name
  ID     Document ID

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --help           show CLI help
```

_See code: [src/commands/es/get.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/es/get.ts)_

## `kourou es:insert INDEX`

Inserts a document directly into ES (will replace if exists)

```
USAGE
  $ kourou es:insert INDEX

ARGUMENTS
  INDEX  ES Index name

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --body=body      [default: {}] Document body in JSON
  --help           show CLI help
  --id=id          Document ID
```

_See code: [src/commands/es/insert.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/es/insert.ts)_

## `kourou es:list-index`

Lists available ES indexes

```
USAGE
  $ kourou es:list-index

OPTIONS
  -g, --grep=grep  Match output with pattern
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --help           show CLI help
```

_See code: [src/commands/es/list-index.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/es/list-index.ts)_

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
  --batch-size=batch-size  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --path=path              Dump directory (default: index name)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/index/dump.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/index/dump.ts)_

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
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                   show CLI help
  --index=index            If set, override the index destination name
  --no-mappings            Skip collections mappings
  --password=password      Kuzzle user password
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/index/restore.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/index/restore.ts)_

## `kourou instance:logs`

Displays the logs of a running Kuzzle

```
USAGE
  $ kourou instance:logs

OPTIONS
  -f, --follow             Follow log output
  -i, --instance=instance  Kuzzle instance name
```

_See code: [src/commands/instance/logs.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/instance/logs.ts)_

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

_See code: [src/commands/instance/spawn.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/instance/spawn.ts)_

## `kourou profile:dump`

Dumps Kuzzle profiles

```
USAGE
  $ kourou profile:dump

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --path=path              [default: profiles] Dump directory
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/profile/dump.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/profile/dump.ts)_

## `kourou profile:restore PATH`

Restores previously dumped Kuzzle profiles

```
USAGE
  $ kourou profile:restore PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/profile/restore.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/profile/restore.ts)_

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
  --arg=arg            Additional argument. Repeatable. (eg: "--arg refresh=wait_for")
  --body=body          Request body in JSON format.
  --help               show CLI help
  --password=password  Kuzzle user password
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/query.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/query.ts)_

## `kourou role:dump`

Dumps Kuzzle roles

```
USAGE
  $ kourou role:dump

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --path=path              [default: roles] Dump directory
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/role/dump.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/role/dump.ts)_

## `kourou role:restore PATH`

Restores previously dumped Kuzzle roles

```
USAGE
  $ kourou role:restore PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  -h, --host=host          [default: localhost] Kuzzle server host
  -p, --port=port          [default: 7512] Kuzzle server port
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                   show CLI help
  --password=password      Kuzzle user password
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/role/restore.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/role/restore.ts)_

## `kourou vault:add SECRETS-FILE KEY VALUE`

Adds an encrypted key to a secrets file

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

_See code: [src/commands/vault/add.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/vault/add.ts)_

## `kourou vault:encrypt FILE`

Encrypts an entire file.

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

_See code: [src/commands/vault/encrypt.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/vault/encrypt.ts)_

## `kourou vault:show SECRETS-FILE KEY`

Prints an encrypted key.

```
USAGE
  $ kourou vault:show SECRETS-FILE KEY

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file
  KEY           Path to the key (lodash style)

OPTIONS
  --vault-key=vault-key  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)
```

_See code: [src/commands/vault/show.ts](https://github.com/kuzzleio/kourou/blob/v0.7.0/src/commands/vault/show.ts)_
<!-- commandsstop -->

# Where does this weird name comes from?

We liked the idea that this CLI is like a launchpad for the Kuzzle rocket. The place where you launch and pilot your Kuzzle instance. The place where the European Space Agency launches their rockets is in the country near the city of [Kourou](https://www.wikiwand.com/en/Kourou), in French Guiana, so we liked the idea that the Kuzzle rockets would take off from there.

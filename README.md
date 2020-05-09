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
kourou/0.11.0 linux-x64 node-v12.16.0
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
  --ssl                          [default: true for port 443] Use SSL to connect to Kuzzle
  --protocol                     [default: http] Protocol used to connect to Kuzzle (`http` or `ws`)
```

By environment variables:
```
  KUZZLE_HOST                [default: localhost] Kuzzle server host
  KUZZLE_PORT                [default: 7512] Kuzzle server port
  KUZZLE_USERNAME            [default: anonymous] Kuzzle user
  KUZZLE_PASSWORD            Kuzzle user password
  KUZZLE_SSL                 Use SSL to connect to Kuzzle
  KUZZLE_PROTOCOL            Protocol used to connect to Kuzzle (`http` or `ws`)
```

## User impersonation

You can impersonate a user before executing a command with the `--as` flag and a user `kuid`.

User impersonation require the following rights for the authenticated user: `security:createApiKey`, `security:deleteApiKey`

```bash
$ kourou query auth:getCurrentUser --as gordon --username admin --password admin
 
 🚀 Kourou - Executes an API query.
 
 [ℹ] Connecting to http://localhost:7512 ...
 [ℹ] Impersonate user "gordon"

[...]
```

# Commands

<!-- commands -->
* [`kourou api-key:check TOKEN`](#kourou-api-keycheck-token)
* [`kourou api-key:create USER`](#kourou-api-keycreate-user)
* [`kourou api-key:delete USER ID`](#kourou-api-keydelete-user-id)
* [`kourou api-key:search USER`](#kourou-api-keysearch-user)
* [`kourou collection:create INDEX COLLECTION`](#kourou-collectioncreate-index-collection)
* [`kourou collection:export INDEX COLLECTION`](#kourou-collectionexport-index-collection)
* [`kourou collection:import PATH`](#kourou-collectionimport-path)
* [`kourou config:diff FIRST SECOND`](#kourou-configdiff-first-second)
* [`kourou document:create INDEX COLLECTION`](#kourou-documentcreate-index-collection)
* [`kourou document:get INDEX COLLECTION ID`](#kourou-documentget-index-collection-id)
* [`kourou document:search INDEX COLLECTION`](#kourou-documentsearch-index-collection)
* [`kourou es:get INDEX ID`](#kourou-esget-index-id)
* [`kourou es:insert INDEX`](#kourou-esinsert-index)
* [`kourou es:list-index`](#kourou-eslist-index)
* [`kourou file:decrypt FILE`](#kourou-filedecrypt-file)
* [`kourou file:encrypt FILE`](#kourou-fileencrypt-file)
* [`kourou file:test FILE`](#kourou-filetest-file)
* [`kourou help [COMMAND]`](#kourou-help-command)
* [`kourou import PATH`](#kourou-import-path)
* [`kourou index:export INDEX`](#kourou-indexexport-index)
* [`kourou index:import PATH`](#kourou-indeximport-path)
* [`kourou instance:logs`](#kourou-instancelogs)
* [`kourou instance:spawn`](#kourou-instancespawn)
* [`kourou profile:export`](#kourou-profileexport)
* [`kourou profile:import PATH`](#kourou-profileimport-path)
* [`kourou role:export`](#kourou-roleexport)
* [`kourou role:import PATH`](#kourou-roleimport-path)
* [`kourou sdk:execute`](#kourou-sdkexecute)
* [`kourou sdk:query CONTROLLER:ACTION`](#kourou-sdkquery-controlleraction)
* [`kourou vault:add SECRETS-FILE KEY VALUE`](#kourou-vaultadd-secrets-file-key-value)
* [`kourou vault:decrypt FILE`](#kourou-vaultdecrypt-file)
* [`kourou vault:encrypt FILE`](#kourou-vaultencrypt-file)
* [`kourou vault:show SECRETS-FILE [KEY]`](#kourou-vaultshow-secrets-file-key)
* [`kourou vault:test SECRETS-FILE`](#kourou-vaulttest-secrets-file)

## `kourou api-key:check TOKEN`

Checks an API key validity

```
USAGE
  $ kourou api-key:check TOKEN

ARGUMENTS
  TOKEN  API key token

OPTIONS
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLE
  kourou api-key:check eyJhbG...QxfQrc
```

_See code: [src/commands/api-key/check.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/api-key/check.ts)_

## `kourou api-key:create USER`

Creates a new API Key for a user

```
USAGE
  $ kourou api-key:create USER

ARGUMENTS
  USER  User kuid

OPTIONS
  -d, --description=description  (required) API Key description
  --as=as                        Impersonate a user
  --expire=expire                [default: -1] API Key validity
  --help                         show CLI help
  --host=host                    [default: localhost] Kuzzle server host
  --id=id                        API Key unique ID
  --password=password            Kuzzle user password
  --port=port                    [default: 7512] Kuzzle server port
  --protocol=protocol            [default: http] Kuzzle protocol (http or ws)
  --ssl                          Use SSL to connect to Kuzzle
  --username=username            [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/api-key/create.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/api-key/create.ts)_

## `kourou api-key:delete USER ID`

Deletes an API key.

```
USAGE
  $ kourou api-key:delete USER ID

ARGUMENTS
  USER  User kuid
  ID    API Key unique ID

OPTIONS
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLE
  kourou vault:delete sigfox-gateway 1k-BF3EBjsXdvA2PR8x
```

_See code: [src/commands/api-key/delete.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/api-key/delete.ts)_

## `kourou api-key:search USER`

Lists a user's API Keys.

```
USAGE
  $ kourou api-key:search USER

ARGUMENTS
  USER  User kuid

OPTIONS
  --as=as              Impersonate a user
  --filter=filter      Filter to match the API Key descriptions
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/api-key/search.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/api-key/search.ts)_

## `kourou collection:create INDEX COLLECTION`

Creates a collection

```
USAGE
  $ kourou collection:create INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  --as=as              Impersonate a user

  --body=body          [default: {}] Collection mappings and settings in JS or JSON format. Will be read from STDIN if
                       available

  --help               show CLI help

  --host=host          [default: localhost] Kuzzle server host

  --password=password  Kuzzle user password

  --port=port          [default: 7512] Kuzzle server port

  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)

  --ssl                Use SSL to connect to Kuzzle

  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/collection/create.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/collection/create.ts)_

## `kourou collection:export INDEX COLLECTION`

Exports a collection (JSONL format)

```
USAGE
  $ kourou collection:export INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --editor                 Open an editor (EDITOR env variable) to edit the query before sending
  --help                   show CLI help
  --host=host              [default: localhost] Kuzzle server host
  --password=password      Kuzzle user password
  --path=path              Dump root directory
  --port=port              [default: 7512] Kuzzle server port
  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)
  --query=query            [default: {}] Only dump documents matching the query (JS or JSON format)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou collection:export nyc-open-data yellow-taxi
  kourou collection:export nyc-open-data yellow-taxi --query '{ term: { city: "Saigon" } }'
```

_See code: [src/commands/collection/export.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/collection/export.ts)_

## `kourou collection:import PATH`

Imports a collection

```
USAGE
  $ kourou collection:import PATH

ARGUMENTS
  PATH  Dump directory path

OPTIONS
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --collection=collection  If set, override the collection destination name
  --help                   show CLI help
  --host=host              [default: localhost] Kuzzle server host
  --index=index            If set, override the index destination name
  --no-mappings            Skip collection mappings
  --password=password      Kuzzle user password
  --port=port              [default: 7512] Kuzzle server port
  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/collection/import.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/collection/import.ts)_

## `kourou config:diff FIRST SECOND`

Returns differences between two Kuzzle configuration files (kuzzlerc)

```
USAGE
  $ kourou config:diff FIRST SECOND

ARGUMENTS
  FIRST   First configuration file
  SECOND  Second configuration file

OPTIONS
  --strict  Exit with an error if differences are found
  --values  Also displays value changes

EXAMPLE
  kourou config:diff config/local/kuzzlerc config/production/kuzzlerc
```

_See code: [src/commands/config/diff.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/config/diff.ts)_

## `kourou document:create INDEX COLLECTION`

Creates a document

```
USAGE
  $ kourou document:create INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  --as=as              Impersonate a user
  --body=body          [default: {}] Document body in JS or JSON format. Will be read from STDIN if available
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --id=id              Optional document ID
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)
  --replace            Replaces the document if it already exists
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou document:create iot sensors --body '{network: "sigfox"}'
  kourou document:create iot sensors < document.json
```

_See code: [src/commands/document/create.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/document/create.ts)_

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
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/document/get.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/document/get.ts)_

## `kourou document:search INDEX COLLECTION`

Searches for documents

```
USAGE
  $ kourou document:search INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  --as=as              Impersonate a user
  --editor             Open an editor (EDITOR env variable) to edit the request before sending
  --from=from          Optional offset
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)
  --query=query        [default: {}] Query in JS or JSON format.
  --scroll=scroll      Optional scroll TTL
  --size=size          Optional page size
  --sort=sort          [default: {}] Sort in JS or JSON format.
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou document:search iot sensors --query '{ term: { name: "corona" } }'
  kourou document:search iot sensors --editor
```

_See code: [src/commands/document/search.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/document/search.ts)_

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

_See code: [src/commands/es/get.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/es/get.ts)_

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

_See code: [src/commands/es/insert.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/es/insert.ts)_

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

_See code: [src/commands/es/list-index.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/es/list-index.ts)_

## `kourou file:decrypt FILE`

Decrypts an encrypted file.

```
USAGE
  $ kourou file:decrypt FILE

ARGUMENTS
  FILE  Encrypted file

OPTIONS
  -f, --force                    Overwrite the output file if it already exists
  -o, --output-file=output-file  Output file (default: remove ".enc")
  --vault-key=vault-key          Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

EXAMPLES
  kourou file:decrypt books/cryptonomicon.txt.enc --vault-key <vault-key>
  kourou file:decrypt books/cryptonomicon.txt.enc -o books/cryptonomicon.txt --vault-key <vault-key>
```

_See code: [src/commands/file/decrypt.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/file/decrypt.ts)_

## `kourou file:encrypt FILE`

Encrypts an entire file.

```
USAGE
  $ kourou file:encrypt FILE

ARGUMENTS
  FILE  Filename

OPTIONS
  -f, --force                    Overwrite the output file if it already exists
  -o, --output-file=output-file  Output file (default: <filename>.enc)
  --vault-key=vault-key          Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

EXAMPLES
  kourou file:encrypt books/cryptonomicon.txt --vault-key <vault-key>
  kourou file:encrypt books/cryptonomicon.txt -o books/cryptonomicon.txt.enc --vault-key <vault-key>
```

_See code: [src/commands/file/encrypt.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/file/encrypt.ts)_

## `kourou file:test FILE`

Tests if an encrypted file can be decrypted.

```
USAGE
  $ kourou file:test FILE

ARGUMENTS
  FILE  Encrypted file

OPTIONS
  --vault-key=vault-key  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

EXAMPLE
  kourou file:test books/cryptonomicon.txt.enc --vault-key <vault-key>
```

_See code: [src/commands/file/test.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/file/test.ts)_

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

## `kourou import PATH`

Recursively imports dump files from a root directory

```
USAGE
  $ kourou import PATH

ARGUMENTS
  PATH  Root directory containing dumps

OPTIONS
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                   show CLI help
  --host=host              [default: localhost] Kuzzle server host
  --password=password      Kuzzle user password
  --port=port              [default: 7512] Kuzzle server port
  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/import.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/import.ts)_

## `kourou index:export INDEX`

Exports an index (JSONL format)

```
USAGE
  $ kourou index:export INDEX

ARGUMENTS
  INDEX  Index name

OPTIONS
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --help                   show CLI help
  --host=host              [default: localhost] Kuzzle server host
  --password=password      Kuzzle user password
  --path=path              Dump root directory
  --port=port              [default: 7512] Kuzzle server port
  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/index/export.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/index/export.ts)_

## `kourou index:import PATH`

Imports an index (JSONL format)

```
USAGE
  $ kourou index:import PATH

ARGUMENTS
  PATH  Dump directory or file

OPTIONS
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                   show CLI help
  --host=host              [default: localhost] Kuzzle server host
  --index=index            If set, override the index destination name
  --no-mappings            Skip collections mappings
  --password=password      Kuzzle user password
  --port=port              [default: 7512] Kuzzle server port
  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou index:import ./dump/iot-data
  kourou index:import ./dump/iot-data --index iot-data-production --no-mappings
```

_See code: [src/commands/index/import.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/index/import.ts)_

## `kourou instance:logs`

Displays the logs of a running Kuzzle

```
USAGE
  $ kourou instance:logs

OPTIONS
  -f, --follow             Follow log output
  -i, --instance=instance  Kuzzle instance name
```

_See code: [src/commands/instance/logs.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/instance/logs.ts)_

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

_See code: [src/commands/instance/spawn.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/instance/spawn.ts)_

## `kourou profile:export`

Exports profiles

```
USAGE
  $ kourou profile:export

OPTIONS
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --path=path          [default: profiles] Dump directory
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/profile/export.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/profile/export.ts)_

## `kourou profile:import PATH`

Imports profiles

```
USAGE
  $ kourou profile:import PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/profile/import.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/profile/import.ts)_

## `kourou role:export`

Exports roles

```
USAGE
  $ kourou role:export

OPTIONS
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --path=path          [default: roles] Dump directory
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/role/export.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/role/export.ts)_

## `kourou role:import PATH`

Imports roles.

```
USAGE
  $ kourou role:import PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/role/import.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/role/import.ts)_

## `kourou sdk:execute`

Executes arbitrary code.

```
USAGE
  $ kourou sdk:execute

OPTIONS
  -v, --var=var        Additional arguments injected into the code. (eg: --var 'index="iot-data"'
  --as=as              Impersonate a user
  --code=code          Code to execute. Will be read from STDIN if available.
  --editor             Open an editor (EDITOR env variable) to edit the code before executing it.
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: http] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Executes arbitrary code.

  Code Execution

     provided code will be executed in an async method
     you can access a connected and authenticated SDK with the "sdk" variable
     templated variable passed as the command arguments are also accessible within the same name
     return value will be printed on the standard output (eg: 'return await sdk.server.now();')
     error will be catched and printed on the error output (eg: 'throw new Error("failure");')

  Provide code

     code can be passed with the --code flag
     code will be read from STDIN if available

     Examples:
       - kourou sdk:execute --code 'return await sdk.server.now()'
       - kourou sdk:execute --code 'return await sdk.index.exists(index)' --var 'index="iot-data"'
       - kourou sdk:execute < snippet.js
       - echo 'return await sdk.server.now()' | kourou sdk:execute

  Other

     use the --editor flag to modify the code before executing it

     Examples:
       - kourou sdk:execute --code 'return await sdk.server.now()' --editor
```

_See code: [src/commands/sdk/execute.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/sdk/execute.ts)_

## `kourou sdk:query CONTROLLER:ACTION`

Executes an API query.

```
USAGE
  $ kourou sdk:query CONTROLLER:ACTION

ARGUMENTS
  CONTROLLER:ACTION  Controller and action (eg: "server:now")

OPTIONS
  -a, --arg=arg                Additional argument. Repeatable. (e.g. "-a refresh=wait_for")
  -c, --collection=collection  Collection argument
  -i, --index=index            Index argument
  --as=as                      Impersonate a user
  --body=body                  [default: {}] Request body in JS or JSON format. Will be read from STDIN if available.
  --editor                     Open an editor (EDITOR env variable) to edit the request before sending.
  --help                       show CLI help
  --host=host                  [default: localhost] Kuzzle server host
  --password=password          Kuzzle user password
  --port=port                  [default: 7512] Kuzzle server port
  --protocol=protocol          [default: http] Kuzzle protocol (http or ws)
  --ssl                        Use SSL to connect to Kuzzle
  --username=username          [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Executes an API query.

  Query arguments

     arguments can be passed and repeated using the --arg or -a flag.
     index and collection names can be passed with --index (-i) and --collection (-c) flags

     Examples:
       - kourou query document:get -i iot -c sensors -a _id=sigfox-42

  Query body

     body can be passed with the --body flag with either a JSON or JS string.
     body will be read from STDIN if available

     Examples:
       - kourou query document:create -i iot -c sensors --body '{creation: Date.now())}'
       - kourou query admin:loadMappings < mappings.json
       - echo '{dynamic: "strict"}' | kourou query collection:create -i iot -c sensors

  Other

     use the --editor flag to modify the query before sending it to Kuzzle

     Examples:
       - kourou query document:create -i iot -c sensors --editor
```

_See code: [src/commands/sdk/query.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/sdk/query.ts)_

## `kourou vault:add SECRETS-FILE KEY VALUE`

Adds an encrypted key to an encrypted secrets file.

```
USAGE
  $ kourou vault:add SECRETS-FILE KEY VALUE

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file
  KEY           Path to the key (lodash style)
  VALUE         Value to encrypt

OPTIONS
  --vault-key=vault-key  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Adds an encrypted key to an encrypted secrets file.

  A new secrets file is created if it does not yet exist.

  Encrypted secrets are meant to be loaded inside an application with Kuzzle Vault.

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.

EXAMPLE
  kourou vault:add config/secrets.enc.json aws.s3.keyId b61e267676660c314b006b06 --vault-key <vault-key>
```

_See code: [src/commands/vault/add.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/vault/add.ts)_

## `kourou vault:decrypt FILE`

Decrypts an entire secrets file.

```
USAGE
  $ kourou vault:decrypt FILE

ARGUMENTS
  FILE  File containing encrypted secrets

OPTIONS
  -f, --force                    Overwrite the output file if it already exists
  -o, --output-file=output-file  Output file (default: remove ".enc")
  --vault-key=vault-key          Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Decrypts an entire secrets file.

  Decrypted secrets file must NEVER be committed into the repository.

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.

EXAMPLES
  kourou vault:decrypt config/secrets.enc.json --vault-key <vault-key>
  kourou vault:decrypt config/secrets.enc.json -o config/secrets.json --vault-key <vault-key>
```

_See code: [src/commands/vault/decrypt.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/vault/decrypt.ts)_

## `kourou vault:encrypt FILE`

Encrypts an entire secrets file.

```
USAGE
  $ kourou vault:encrypt FILE

ARGUMENTS
  FILE  File containing unencrypted secrets

OPTIONS
  -f, --force                    Overwrite the output file if it already exists
  -o, --output-file=output-file  Output file (default: <file>.enc.json)
  --vault-key=vault-key          Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Encrypts an entire secrets file.

  The secrets file must be in JSON format and it must contain only strings or objects.

  Example:
  {
     aws: {
       s3: {
         keyId: 'b61e267676660c314b006b06'
       }
     }
  }

  Encrypted secrets are meant to be loaded inside an application with Kuzzle Vault.

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.

EXAMPLES
  kourou vault:encrypt config/secrets.json --vault-key <vault-key>
  kourou vault:encrypt config/secrets.json -o config/secrets_prod.enc.json --vault-key <vault-key>
```

_See code: [src/commands/vault/encrypt.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/vault/encrypt.ts)_

## `kourou vault:show SECRETS-FILE [KEY]`

Prints an encrypted secrets file content.

```
USAGE
  $ kourou vault:show SECRETS-FILE [KEY]

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file
  KEY           Path to a key (lodash style)

OPTIONS
  --vault-key=vault-key  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Prints an encrypted secrets file content.

  This method can display either:
    - the entire content of the secrets file
    - a single key value

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.

EXAMPLES
  kourou vault:show config/secrets.enc.json --vault-key <vault-key>
  kourou vault:show config/secrets.enc.json aws.s3.secretKey --vault-key <vault-key>
```

_See code: [src/commands/vault/show.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/vault/show.ts)_

## `kourou vault:test SECRETS-FILE`

Tests if an encrypted secrets file can be decrypted.

```
USAGE
  $ kourou vault:test SECRETS-FILE

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file

OPTIONS
  --vault-key=vault-key  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Tests if an encrypted secrets file can be decrypted.

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.

EXAMPLE
  kourou vault:test config/secrets.enc.json --vault-key <vault-key>
```

_See code: [src/commands/vault/test.ts](https://github.com/kuzzleio/kourou/blob/v0.11.0/src/commands/vault/test.ts)_
<!-- commandsstop -->

# Where does this weird name comes from?

We liked the idea that this CLI is like a launchpad for the Kuzzle rocket. The place where you launch and pilot your Kuzzle instance. The place where the European Space Agency launches their rockets is in the country near the city of [Kourou](https://www.wikiwand.com/en/Kourou), in French Guiana, so we liked the idea that the Kuzzle rockets would take off from there.

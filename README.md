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
<!-- tocstop -->

:warning: This project is currently in beta and breaking changes may occur until the 1.0.0

# Usage

<!-- usage -->
```sh-session
$ npm install -g kourou
$ kourou COMMAND
running command...
$ kourou (-v|--version|version)
kourou/0.17.2 linux-x64 node-v12.16.2
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

Then any argument will be passed as-is to the `sdk:query` method.

# Commands

<!-- commands -->
* [`kourou api-key:check TOKEN`](#kourou-api-keycheck-token)
* [`kourou api-key:create USER`](#kourou-api-keycreate-user)
* [`kourou api-key:delete USER ID`](#kourou-api-keydelete-user-id)
* [`kourou api-key:search USER`](#kourou-api-keysearch-user)
* [`kourou app:scaffold NAME`](#kourou-appscaffold-name)
* [`kourou app:start-services`](#kourou-appstart-services)
* [`kourou collection:create INDEX COLLECTION [BODY]`](#kourou-collectioncreate-index-collection-body)
* [`kourou collection:export INDEX COLLECTION`](#kourou-collectionexport-index-collection)
* [`kourou collection:import PATH`](#kourou-collectionimport-path)
* [`kourou config:diff FIRST SECOND`](#kourou-configdiff-first-second)
* [`kourou document:search INDEX COLLECTION [QUERY]`](#kourou-documentsearch-index-collection-query)
* [`kourou es:indices:cat`](#kourou-esindicescat)
* [`kourou es:indices:get INDEX ID`](#kourou-esindicesget-index-id)
* [`kourou es:indices:insert INDEX`](#kourou-esindicesinsert-index)
* [`kourou es:snapshot:create REPOSITORY NAME`](#kourou-essnapshotcreate-repository-name)
* [`kourou es:snapshot:create-repository REPOSITORY LOCATION`](#kourou-essnapshotcreate-repository-repository-location)
* [`kourou es:snapshot:list REPOSITORY`](#kourou-essnapshotlist-repository)
* [`kourou es:snapshot:restore REPOSITORY NAME`](#kourou-essnapshotrestore-repository-name)
* [`kourou file:decrypt FILE`](#kourou-filedecrypt-file)
* [`kourou file:encrypt FILE`](#kourou-fileencrypt-file)
* [`kourou file:test FILE`](#kourou-filetest-file)
* [`kourou help [COMMAND]`](#kourou-help-command)
* [`kourou import PATH`](#kourou-import-path)
* [`kourou index:export INDEX`](#kourou-indexexport-index)
* [`kourou index:import PATH`](#kourou-indeximport-path)
* [`kourou instance:kill`](#kourou-instancekill)
* [`kourou instance:list`](#kourou-instancelist)
* [`kourou instance:logs`](#kourou-instancelogs)
* [`kourou instance:spawn`](#kourou-instancespawn)
* [`kourou profile:export`](#kourou-profileexport)
* [`kourou profile:import PATH`](#kourou-profileimport-path)
* [`kourou realtime:subscribe INDEX COLLECTION [FILTERS]`](#kourou-realtimesubscribe-index-collection-filters)
* [`kourou redis:list-keys [MATCH]`](#kourou-redislist-keys-match)
* [`kourou role:export`](#kourou-roleexport)
* [`kourou role:import PATH`](#kourou-roleimport-path)
* [`kourou sdk:execute [CODE]`](#kourou-sdkexecute-code)
* [`kourou sdk:query CONTROLLER:ACTION`](#kourou-sdkquery-controlleraction)
* [`kourou user:export`](#kourou-userexport)
* [`kourou user:export-mappings`](#kourou-userexport-mappings)
* [`kourou user:import PATH`](#kourou-userimport-path)
* [`kourou user:import-mappings PATH`](#kourou-userimport-mappings-path)
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
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLE
  kourou api-key:check eyJhbG...QxfQrc
```

_See code: [src/commands/api-key/check.ts](src/commands/api-key/check.ts)_

## `kourou api-key:create USER`

Creates a new API Key for a user

```
USAGE
  $ kourou api-key:create USER

ARGUMENTS
  USER  User kuid

OPTIONS
  -d, --description=description  (required) API Key description
  --api-key=api-key              Kuzzle user api-key
  --as=as                        Impersonate a user
  --expire=expire                [default: -1] API Key validity
  --help                         show CLI help
  --host=host                    [default: localhost] Kuzzle server host
  --id=id                        API Key unique ID
  --password=password            Kuzzle user password
  --port=port                    [default: 7512] Kuzzle server port
  --protocol=protocol            [default: ws] Kuzzle protocol (http or ws)
  --ssl                          Use SSL to connect to Kuzzle
  --username=username            [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/api-key/create.ts](src/commands/api-key/create.ts)_

## `kourou api-key:delete USER ID`

Deletes an API key.

```
USAGE
  $ kourou api-key:delete USER ID

ARGUMENTS
  USER  User kuid
  ID    API Key unique ID

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLE
  kourou vault:delete sigfox-gateway 1k-BF3EBjsXdvA2PR8x
```

_See code: [src/commands/api-key/delete.ts](src/commands/api-key/delete.ts)_

## `kourou api-key:search USER`

Lists a user's API Keys.

```
USAGE
  $ kourou api-key:search USER

ARGUMENTS
  USER  User kuid

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --filter=filter      Filter to match the API Key descriptions
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/api-key/search.ts](src/commands/api-key/search.ts)_

## `kourou app:scaffold NAME`

Scaffolds a new Kuzzle application

```
USAGE
  $ kourou app:scaffold NAME

ARGUMENTS
  NAME  Application name

OPTIONS
  --help  show CLI help
```

_See code: [src/commands/app/scaffold.ts](src/commands/app/scaffold.ts)_

## `kourou app:start-services`

Starts Kuzzle services (Elasticsearch and Redis)

```
USAGE
  $ kourou app:start-services

OPTIONS
  --check  Check prerequisite before running services
  --help   show CLI help
```

_See code: [src/commands/app/start-services.ts](src/commands/app/start-services.ts)_

## `kourou collection:create INDEX COLLECTION [BODY]`

Creates a collection

```
USAGE
  $ kourou collection:create INDEX COLLECTION [BODY]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  BODY        Collection mappings and settings in JS or JSON format. Will be read from STDIN if available

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/collection/create.ts](src/commands/collection/create.ts)_

## `kourou collection:export INDEX COLLECTION`

Exports a collection (JSONL format)

```
USAGE
  $ kourou collection:export INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  --api-key=api-key        Kuzzle user api-key
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

_See code: [src/commands/collection/export.ts](src/commands/collection/export.ts)_

## `kourou collection:import PATH`

Imports a collection

```
USAGE
  $ kourou collection:import PATH

ARGUMENTS
  PATH  Dump directory path

OPTIONS
  --api-key=api-key        Kuzzle user api-key
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

_See code: [src/commands/collection/import.ts](src/commands/collection/import.ts)_

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

_See code: [src/commands/config/diff.ts](src/commands/config/diff.ts)_

## `kourou document:search INDEX COLLECTION [QUERY]`

Searches for documents

```
USAGE
  $ kourou document:search INDEX COLLECTION [QUERY]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  QUERY       Query in JS or JSON format.

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --editor             Open an editor (EDITOR env variable) to edit the request before sending
  --from=from          Optional offset
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --scroll=scroll      Optional scroll TTL
  --size=size          Optional page size
  --sort=sort          [default: {}] Sort in JS or JSON format.
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou document:search iot sensors '{ term: { name: "corona" } }'
  kourou document:search iot sensors --editor
```

_See code: [src/commands/document/search.ts](src/commands/document/search.ts)_

## `kourou es:indices:cat`

Lists available ES indexes

```
USAGE
  $ kourou es:indices:cat

OPTIONS
  -g, --grep=grep  Match output with pattern
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --help           show CLI help
```

_See code: [src/commands/es/indices/cat.ts](src/commands/es/indices/cat.ts)_

## `kourou es:indices:get INDEX ID`

Gets a document from ES

```
USAGE
  $ kourou es:indices:get INDEX ID

ARGUMENTS
  INDEX  ES Index name
  ID     Document ID

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --help           show CLI help
```

_See code: [src/commands/es/indices/get.ts](src/commands/es/indices/get.ts)_

## `kourou es:indices:insert INDEX`

Inserts a document directly into ES (will replace if exists)

```
USAGE
  $ kourou es:indices:insert INDEX

ARGUMENTS
  INDEX  ES Index name

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --body=body      [default: {}] Document body in JSON
  --help           show CLI help
  --id=id          Document ID
```

_See code: [src/commands/es/indices/insert.ts](src/commands/es/indices/insert.ts)_

## `kourou es:snapshot:create REPOSITORY NAME`

Create a snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:create REPOSITORY NAME

ARGUMENTS
  REPOSITORY  ES repository name
  NAME        ES snapshot name

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --help           show CLI help
```

_See code: [src/commands/es/snapshot/create.ts](src/commands/es/snapshot/create.ts)_

## `kourou es:snapshot:create-repository REPOSITORY LOCATION`

Create a FS snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:create-repository REPOSITORY LOCATION

ARGUMENTS
  REPOSITORY  ES repository name
  LOCATION    ES snapshot repository location

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --compress       Compress data when storing them
  --help           show CLI help
```

_See code: [src/commands/es/snapshot/create-repository.ts](src/commands/es/snapshot/create-repository.ts)_

## `kourou es:snapshot:list REPOSITORY`

List all snapshot from a repository acknowledge by an ES instance

```
USAGE
  $ kourou es:snapshot:list REPOSITORY

ARGUMENTS
  REPOSITORY  Name of repository from which to fetch the snapshot information

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --help           show CLI help
```

_See code: [src/commands/es/snapshot/list.ts](src/commands/es/snapshot/list.ts)_

## `kourou es:snapshot:restore REPOSITORY NAME`

Restore a snapshot into an ES instance

```
USAGE
  $ kourou es:snapshot:restore REPOSITORY NAME

ARGUMENTS
  REPOSITORY  ES repository name
  NAME        ES snapshot name

OPTIONS
  -h, --host=host  [default: localhost] Elasticsearch server host
  -p, --port=port  [default: 9200] Elasticsearch server port
  --help           show CLI help
```

_See code: [src/commands/es/snapshot/restore.ts](src/commands/es/snapshot/restore.ts)_

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

_See code: [src/commands/file/decrypt.ts](src/commands/file/decrypt.ts)_

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

_See code: [src/commands/file/encrypt.ts](src/commands/file/encrypt.ts)_

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

_See code: [src/commands/file/test.ts](src/commands/file/test.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `kourou import PATH`

Recursively imports dump files from a root directory

```
USAGE
  $ kourou import PATH

ARGUMENTS
  PATH  Root directory containing dumps

OPTIONS
  --api-key=api-key        Kuzzle user api-key
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                   show CLI help
  --host=host              [default: localhost] Kuzzle server host
  --password=password      Kuzzle user password
  --port=port              [default: 7512] Kuzzle server port
  --preserve-anonymous     Preserve anonymous rights
  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/import.ts](src/commands/import.ts)_

## `kourou index:export INDEX`

Exports an index (JSONL format)

```
USAGE
  $ kourou index:export INDEX

ARGUMENTS
  INDEX  Index name

OPTIONS
  --api-key=api-key        Kuzzle user api-key
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

_See code: [src/commands/index/export.ts](src/commands/index/export.ts)_

## `kourou index:import PATH`

Imports an index (JSONL format)

```
USAGE
  $ kourou index:import PATH

ARGUMENTS
  PATH  Dump directory or file

OPTIONS
  --api-key=api-key        Kuzzle user api-key
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

_See code: [src/commands/index/import.ts](src/commands/index/import.ts)_

## `kourou instance:kill`

Stop and remove all the containers of a running kuzzle instance

```
USAGE
  $ kourou instance:kill

OPTIONS
  -a, --all                Kill all instances
  -i, --instance=instance  Kuzzle instance name [ex: stack-0]
```

_See code: [src/commands/instance/kill.ts](src/commands/instance/kill.ts)_

## `kourou instance:list`

Lists the Kuzzle running instances

```
USAGE
  $ kourou instance:list
```

_See code: [src/commands/instance/list.ts](src/commands/instance/list.ts)_

## `kourou instance:logs`

Displays the logs of a running Kuzzle

```
USAGE
  $ kourou instance:logs

OPTIONS
  -f, --follow             Follow log output
  -i, --instance=instance  Kuzzle instance name
```

_See code: [src/commands/instance/logs.ts](src/commands/instance/logs.ts)_

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

_See code: [src/commands/instance/spawn.ts](src/commands/instance/spawn.ts)_

## `kourou profile:export`

Exports profiles

```
USAGE
  $ kourou profile:export

OPTIONS
  --api-key=api-key    Kuzzle user api-key
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

_See code: [src/commands/profile/export.ts](src/commands/profile/export.ts)_

## `kourou profile:import PATH`

Imports profiles

```
USAGE
  $ kourou profile:import PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/profile/import.ts](src/commands/profile/import.ts)_

## `kourou realtime:subscribe INDEX COLLECTION [FILTERS]`

Subscribes to realtime notifications

```
USAGE
  $ kourou realtime:subscribe INDEX COLLECTION [FILTERS]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  FILTERS     Set of Koncorde filters

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user

  --display=display    [default: result] Path of the property to display from the notification (empty string to display
                       everything)

  --editor             Open an editor (EDITOR env variable) to edit the filters before subscribing.

  --help               show CLI help

  --host=host          [default: localhost] Kuzzle server host

  --password=password  Kuzzle user password

  --port=port          [default: 7512] Kuzzle server port

  --protocol=protocol  [default: websocket] Kuzzle protocol (only websocket for realtime)

  --scope=scope        [default: all] Subscribe to document entering or leaving the scope (all, in, out, none)

  --ssl                Use SSL to connect to Kuzzle

  --username=username  [default: anonymous] Kuzzle username (local strategy)

  --users=users        [default: all] Subscribe to users entering or leaving the room (all, in, out, none)

  --volatile=volatile  [default: {}] Additional subscription information used in user join/leave notifications

EXAMPLES
  kourou realtime:subscribe iot-data sensors
  kourou realtime:subscribe iot-data sensors '{ range: { temperature: { gt: 0 } } }'
  kourou realtime:subscribe iot-data sensors '{ exists: "position" }' --scope out
  kourou realtime:subscribe iot-data sensors --users all --volatile '{ clientId: "citizen-kane" }'
  kourou realtime:subscribe iot-data sensors --display result._source.temperature
```

_See code: [src/commands/realtime/subscribe.ts](src/commands/realtime/subscribe.ts)_

## `kourou redis:list-keys [MATCH]`

Lists keys stored in Redis

```
USAGE
  $ kourou redis:list-keys [MATCH]

ARGUMENTS
  MATCH  [default: *] Match Redis keys with a pattern

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --max=max            [default: -1] Maximum number of page to retrieve (-1 to retrieve everything)
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --remove             Remove matching keys
  --size=size          [default: 100] Page size
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou redis:list-keys "*cluster*"
  kourou redis:list-keys "counters/*" --remove
```

_See code: [src/commands/redis/list-keys.ts](src/commands/redis/list-keys.ts)_

## `kourou role:export`

Exports roles

```
USAGE
  $ kourou role:export

OPTIONS
  --api-key=api-key    Kuzzle user api-key
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

_See code: [src/commands/role/export.ts](src/commands/role/export.ts)_

## `kourou role:import PATH`

Import roles

```
USAGE
  $ kourou role:import PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  --api-key=api-key     Kuzzle user api-key
  --as=as               Impersonate a user
  --help                show CLI help
  --host=host           [default: localhost] Kuzzle server host
  --password=password   Kuzzle user password
  --port=port           [default: 7512] Kuzzle server port
  --preserve-anonymous  Preserve anonymous rights
  --protocol=protocol   [default: ws] Kuzzle protocol (http or websocket)
  --ssl                 Use SSL to connect to Kuzzle
  --username=username   [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/role/import.ts](src/commands/role/import.ts)_

## `kourou sdk:execute [CODE]`

Executes arbitrary code.

```
USAGE
  $ kourou sdk:execute [CODE]

ARGUMENTS
  CODE  Code to execute. Will be read from STDIN if available.

OPTIONS
  -v, --var=var        Additional arguments injected into the code. (eg: --var 'index="iot-data"'
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --editor             Open an editor (EDITOR env variable) to edit the code before executing it.
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --keep-alive         Keep the connection running (websocket only)
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --print-raw          Print only the script result to stdout
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Executes arbitrary code.

  Code Execution

     Provided code will be executed in an async method.
     You can access a connected and authenticated SDK with the "sdk" variable.
     Templated variable passed as the command arguments are also accessible within the same name.
     Returned value will be printed on the standard output (e.g. 'return await sdk.server.now();').
     Errors will be caught and printed on the error output (e.g. 'throw new Error("failure");').

  Provide code

     code can be passed as an argument
     code will be read from STDIN if available

     Examples:
       - kourou sdk:execute 'return await sdk.server.now()'
       - kourou sdk:execute 'return await sdk.index.exists(index)' --var 'index="iot-data"'
       - kourou sdk:execute < snippet.js
       - echo 'return await sdk.server.now()' | kourou sdk:execute

  Other

     use the --editor flag to modify the code before executing it

     Examples:
       - kourou sdk:execute 'return await sdk.server.now()' --editor
```

_See code: [src/commands/sdk/execute.ts](src/commands/sdk/execute.ts)_

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
  --api-key=api-key            Kuzzle user api-key
  --as=as                      Impersonate a user
  --body=body                  [default: {}] Request body in JS or JSON format. Will be read from STDIN if available.
  --body-editor                Open an editor (EDITOR env variable) to edit the body before sending.

  --display=display            [default: result] Path of the property to display from the response (empty string to
                               display the result)

  --editor                     Open an editor (EDITOR env variable) to edit the request before sending.

  --help                       show CLI help

  --host=host                  [default: localhost] Kuzzle server host

  --id=id                      ID argument (_id)

  --password=password          Kuzzle user password

  --port=port                  [default: 7512] Kuzzle server port

  --protocol=protocol          [default: ws] Kuzzle protocol (http or ws)

  --ssl                        Use SSL to connect to Kuzzle

  --username=username          [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Executes an API query.

  Query arguments

     Arguments can be passed and repeated using the --arg or -a flag.
     Index and collection names can be passed with --index (-i) and --collection (-c) flags
     ID can be passed with the --id flag.

     Examples:
       - kourou sdk:query document:delete -i iot -c sensors -a refresh=wait_for

  Query body

     Body can be passed with the --body flag with either a JSON or JS string.
     Body will be read from STDIN if available

     Examples:
       - kourou sdk:query document:create -i iot -c sensors --body '{creation: Date.now())}'
       - kourou sdk:query admin:loadMappings < mappings.json
       - echo '{dynamic: "strict"}' | kourou sdk:query collection:create -i iot -c sensors

  Other

     Use the --editor flag to modify the query before sending it to Kuzzle
     Use the --display flag to display a specific property of the response

     Examples:
       - kourou sdk:query document:create -i iot -c sensors --editor
       - kourou sdk:query server:now --display 'result.now'

  Default fallback to API action

     It's possible to use the "sdk:query" command by only specifying the corresponding controller
     and action as first argument.

     Kourou will try to infer the first arguments to one the following pattern:
       - <command> <index>
       - <command> <body>
       - <command> <index> <collection>
       - <command> <index> <collection> <id>
       - <command> <index> <collection> <body>
       - <command> <index> <collection> <id> <body>

     If a flag is given (-i, -c, --body or --id), then the flag value has priority over
     argument infering.

     Examples:
       - kourou collection:list iot
       - kourou security:createUser '{ "content": { "profileIds": ["default"] } }' --id yagmur
       - kourou collection:delete iot sensors
       - kourou document:createOrReplace iot sensors sigfox-1 '{}'
       - kourou bulk:import iot sensors '{ bulkData: [...] }'
       - kourou admin:loadMappings < mappings.json
```

_See code: [src/commands/sdk/query.ts](src/commands/sdk/query.ts)_

## `kourou user:export`

Exports users to JSON.

```
USAGE
  $ kourou user:export

OPTIONS
  --api-key=api-key                        Kuzzle user api-key
  --as=as                                  Impersonate a user
  --batch-size=batch-size                  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --exclude=exclude                        Exclude users by matching their IDs with a regexp
  --generate-credentials                   Generate credentials with a random password for users
  --generated-username=generated-username  [default: _id] User content property used as a username for local credentials
  --help                                   show CLI help
  --host=host                              [default: localhost] Kuzzle server host
  --password=password                      Kuzzle user password
  --path=path                              [default: users] Dump directory
  --port=port                              [default: 7512] Kuzzle server port
  --protocol=protocol                      [default: ws] Kuzzle protocol (http or websocket)
  --ssl                                    Use SSL to connect to Kuzzle
  --username=username                      [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Exports users to JSON.

  The users will be exported WITHOUT their credentials since Kuzzzle can't access them.

  You can either:
     - Manually re-create credentials for your users
     - Use the "mustChangePasswordIfSetByAdmin" option Kuzzle password policies (see 
  https://github.com/kuzzleio/kuzzle-plugin-auth-passport-local/#optional-properties)
     - Use the "--generate-credentials" flag to auto-generate credentials for your users

  Auto-generation of credentials

     With the "--generate-credentials" flag, Kourou will add credentials for the "local" strategy.
     By default, the username will be the user ID.
     Use the "generated-username" flag to use an other property than the user ID for the generated username
     The password will be a strong random 40 characters string

  Examples:

     - kourou user:export
     - kourou user:export --exclude '.*admin.*' --exclude 'supervisor.*'
     - kourou user:export --generate-credentials
     - kourou user:export --generate-credentials --generated-username content.email
```

_See code: [src/commands/user/export.ts](src/commands/user/export.ts)_

## `kourou user:export-mappings`

Exports users collection mappings to JSON.

```
USAGE
  $ kourou user:export-mappings

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --path=path          [default: users] Dump directory
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/user/export-mappings.ts](src/commands/user/export-mappings.ts)_

## `kourou user:import PATH`

Imports users

```
USAGE
  $ kourou user:import PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/user/import.ts](src/commands/user/import.ts)_

## `kourou user:import-mappings PATH`

Imports users collection mappings

```
USAGE
  $ kourou user:import-mappings PATH

ARGUMENTS
  PATH  Dump file

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or websocket)
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)
```

_See code: [src/commands/user/import-mappings.ts](src/commands/user/import-mappings.ts)_

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

_See code: [src/commands/vault/add.ts](src/commands/vault/add.ts)_

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

_See code: [src/commands/vault/decrypt.ts](src/commands/vault/decrypt.ts)_

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

_See code: [src/commands/vault/encrypt.ts](src/commands/vault/encrypt.ts)_

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

_See code: [src/commands/vault/show.ts](src/commands/vault/show.ts)_

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

_See code: [src/commands/vault/test.ts](src/commands/vault/test.ts)_
<!-- commandsstop -->

# Where does this weird name come from?

We liked the idea that this CLI is like a launchpad for the Kuzzle rocket. The place where you launch and pilot your Kuzzle instance. The place where the European Space Agency launches their rockets is in the country near the city of [Kourou](https://www.wikiwand.com/en/Kourou), in French Guiana, so we liked the idea that the Kuzzle rockets would take off from there.

# Have fun with a quine

[Quine](https://en.wikipedia.org/wiki/Quine_(computing)) are programs able to print their own source code.

```bash
$ kourou-dev sdk:execute --print-raw --code '(
  function quine() {
    const sq = String.fromCharCode(39);
    const lp = String.fromCharCode(40);
    const rp = String.fromCharCode(41);

    console.log("kourou-dev sdk:execute --print-raw --code " + sq + lp + quine.toString() + rp + lp + rp + ";" + sq)
  }
)()'
```

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
* [Telemetry](#telemetry)
<!-- tocstop -->

:warning: This project is currently in beta and breaking changes may occur until the 1.0.0

# Usage

<!-- usage -->
```sh-session
$ npm install -g kourou
$ kourou COMMAND
running command...
$ kourou (-v|--version|version)
kourou/0.28.1 darwin-arm64 node-v20.10.0
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
* [`kourou api-key:check TOKEN`](#kourou-api-keycheck-token)
* [`kourou api-key:create USER`](#kourou-api-keycreate-user)
* [`kourou api-key:delete USER ID`](#kourou-api-keydelete-user-id)
* [`kourou api-key:search USER`](#kourou-api-keysearch-user)
* [`kourou app:debug-proxy`](#kourou-appdebug-proxy)
* [`kourou app:doctor`](#kourou-appdoctor)
* [`kourou app:scaffold DESTINATION`](#kourou-appscaffold-destination)
* [`kourou app:start-services`](#kourou-appstart-services)
* [`kourou autocomplete [SHELL]`](#kourou-autocomplete-shell)
* [`kourou collection:create INDEX COLLECTION [BODY]`](#kourou-collectioncreate-index-collection-body)
* [`kourou collection:export INDEX COLLECTION`](#kourou-collectionexport-index-collection)
* [`kourou collection:import PATH`](#kourou-collectionimport-path)
* [`kourou collection:migrate SCRIPT PATH`](#kourou-collectionmigrate-script-path)
* [`kourou config:diff FIRST SECOND`](#kourou-configdiff-first-second)
* [`kourou document:search INDEX COLLECTION [QUERY]`](#kourou-documentsearch-index-collection-query)
* [`kourou es:aliases:cat`](#kourou-esaliasescat)
* [`kourou es:indices:cat`](#kourou-esindicescat)
* [`kourou es:indices:get INDEX ID`](#kourou-esindicesget-index-id)
* [`kourou es:indices:insert INDEX`](#kourou-esindicesinsert-index)
* [`kourou es:migrate`](#kourou-esmigrate)
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
* [`kourou paas:login`](#kourou-paaslogin)
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

_See code: [lib/commands/api-key/check.js](lib/commands/api-key/check.js)_

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

_See code: [lib/commands/api-key/create.js](lib/commands/api-key/create.js)_

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

_See code: [lib/commands/api-key/delete.js](lib/commands/api-key/delete.js)_

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

_See code: [lib/commands/api-key/search.js](lib/commands/api-key/search.js)_

## `kourou app:debug-proxy`

Create a Proxy Server that allows Chrome to debug Kuzzle remotely using the DebugController

```
USAGE
  $ kourou app:debug-proxy

OPTIONS
  --api-key=api-key          Kuzzle user api-key
  --as=as                    Impersonate a user
  --forwardPort=forwardPort  [default: 9222] Port of the forwarding server
  --help                     show CLI help
  --host=host                [default: localhost] Kuzzle server host
  --keepAuth                 Keep the user authenticated

  --noAutoEnableDebugger     True if Kourou should not enable and disable the Debugger automatically before and after
                             usage

  --password=password        Kuzzle user password

  --port=port                [default: 7512] Kuzzle server port

  --protocol=protocol        [default: ws] Kuzzle protocol (http or ws)

  --showDebuggerEvents       Verbose mode to display events sent to the Chrome Debugger

  --showDebuggerPayloads     Verbose mode to display payloads sent by and to the Chrome Debugger

  --ssl                      Use SSL to connect to Kuzzle

  --ttl=ttl                  [default: 1h] Kuzzle login TTL

  --username=username        [default: anonymous] Kuzzle username (local strategy)
```

_See code: [lib/commands/app/debug-proxy.js](lib/commands/app/debug-proxy.js)_

## `kourou app:doctor`

Analyze a Kuzzle application

```
USAGE
  $ kourou app:doctor

OPTIONS
  --api-key=api-key              Kuzzle user api-key
  --as=as                        Impersonate a user
  --elasticsearch=elasticsearch  [default: http://localhost:9200] Elasticsearch server URL
  --help                         show CLI help
  --host=host                    [default: localhost] Kuzzle server host
  --password=password            Kuzzle user password
  --port=port                    [default: 7512] Kuzzle server port
  --protocol=protocol            [default: ws] Kuzzle protocol (http or ws)
  --ssl                          Use SSL to connect to Kuzzle
  --username=username            [default: anonymous] Kuzzle username (local strategy)
```

_See code: [lib/commands/app/doctor.js](lib/commands/app/doctor.js)_

## `kourou app:scaffold DESTINATION`

Scaffolds a new Kuzzle application

```
USAGE
  $ kourou app:scaffold DESTINATION

ARGUMENTS
  DESTINATION  Directory to scaffold the app

OPTIONS
  --flavor=flavor  [default: generic] Template flavor ("generic", "iot").
  --help           show CLI help
```

_See code: [lib/commands/app/scaffold.js](lib/commands/app/scaffold.js)_

## `kourou app:start-services`

Starts Kuzzle services (Elasticsearch and Redis)

```
USAGE
  $ kourou app:start-services

OPTIONS
  --check  Check prerequisite before running services
  --help   show CLI help
```

_See code: [lib/commands/app/start-services.js](lib/commands/app/start-services.js)_

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

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v1.3.10/src/commands/autocomplete/index.ts)_

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

_See code: [lib/commands/collection/create.js](lib/commands/collection/create.js)_

## `kourou collection:export INDEX COLLECTION`

Exports a collection (JSONL format)

```
USAGE
  $ kourou collection:export INDEX COLLECTION

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

OPTIONS
  --api-key=api-key
      Kuzzle user api-key

  --as=as
      Impersonate a user

  --batch-size=batch-size
      [default: 2000] Maximum batch size (see limits.documentsFetchCount config)

  --editor
      Open an editor (EDITOR env variable) to edit the query before sending

  --fields=fields
      [CSV format only] The list of fields to be included in the CSV export in dot-path format.

      Example:
      --fields oneField,anotherField,yetAnotherOne.nested.moarNested

      Note that the '_id' field is always included in the CSV export. Leaving this option empty implies that all
      exportable fields in the mapping will be exported.

  --format=jsonl|kuzzle|csv
      [default: jsonl] "kuzzle" will export in Kuzzle format usable for internal fixtures,
      "jsonl" allows to import that data back with kourou,
      "csv" allows to import data into Excel (please, specify the fields to export using the --fields option).

  --help
      show CLI help

  --host=host
      [default: localhost] Kuzzle server host

  --password=password
      Kuzzle user password

  --path=path
      Dump root directory

  --port=port
      [default: 7512] Kuzzle server port

  --protocol=protocol
      [default: ws] Kuzzle protocol (http or websocket)

  --query=query
      [default: {}] Only dump documents matching the query (JS or JSON format)

  --scrollTTL=scrollTTL
      [default: 20s] The scroll TTL option to pass to the dump operation (which performs a document.search under the
      hood),
      expressed in ms format, e.g. '2s', '1m', '3h'.

  --ssl
      Use SSL to connect to Kuzzle

  --type=type
      [default: all] Type of the export: all, mappings, data

  --username=username
      [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou collection:export nyc-open-data yellow-taxi
  kourou collection:export nyc-open-data yellow-taxi --query '{ term: { city: "Saigon" } }'
```

_See code: [lib/commands/collection/export.js](lib/commands/collection/export.js)_

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

_See code: [lib/commands/collection/import.js](lib/commands/collection/import.js)_

## `kourou collection:migrate SCRIPT PATH`

Migrate a collection by transforming documents from a dump file and importing them into Kuzzle

```
USAGE
  $ kourou collection:migrate SCRIPT PATH

ARGUMENTS
  SCRIPT  Migration script path
  PATH    Collection dump path

OPTIONS
  --api-key=api-key        Kuzzle user api-key
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --collection=collection  If set, override the collection destination name
  --help                   show CLI help
  --host=host              [default: localhost] Kuzzle server host
  --index=index            If set, override the index destination name
  --password=password      Kuzzle user password
  --port=port              [default: 7512] Kuzzle server port
  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)
  --ssl                    Use SSL to connect to Kuzzle
  --username=username      [default: anonymous] Kuzzle username (local strategy)
```

_See code: [lib/commands/collection/migrate.js](lib/commands/collection/migrate.js)_

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

_See code: [lib/commands/config/diff.js](lib/commands/config/diff.js)_

## `kourou document:search INDEX COLLECTION [QUERY]`

Searches for documents

```
USAGE
  $ kourou document:search INDEX COLLECTION [QUERY]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  QUERY       Search query in JS or JSON format.

OPTIONS
  --api-key=api-key    Kuzzle user api-key
  --as=as              Impersonate a user
  --editor             Open an editor (EDITOR env variable) to edit the request before sending
  --from=from          Optional offset
  --help               show CLI help
  --host=host          [default: localhost] Kuzzle server host
  --lang=lang          [default: koncorde] Specify the query language to use
  --password=password  Kuzzle user password
  --port=port          [default: 7512] Kuzzle server port
  --protocol=protocol  [default: ws] Kuzzle protocol (http or ws)
  --scroll=scroll      Optional scroll TTL
  --size=size          Optional page size
  --sort=sort          [default: {}] Sort in JS or JSON format.
  --ssl                Use SSL to connect to Kuzzle
  --username=username  [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou document:search iot sensors '{ equals: { name: "corona" } }'
  kourou document:search iot sensors '{ match: { name: "cOrOnna" } }' -a lang=elasticsearch
  kourou document:search iot sensors --editor
```

_See code: [lib/commands/document/search.js](lib/commands/document/search.js)_

## `kourou es:aliases:cat`

Lists available ES aliases

```
USAGE
  $ kourou es:aliases:cat

OPTIONS
  -g, --grep=grep  Match output with pattern
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --help           show CLI help
```

_See code: [lib/commands/es/aliases/cat.js](lib/commands/es/aliases/cat.js)_

## `kourou es:indices:cat`

Lists available ES indexes

```
USAGE
  $ kourou es:indices:cat

OPTIONS
  -g, --grep=grep  Match output with pattern
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --help           show CLI help
```

_See code: [lib/commands/es/indices/cat.js](lib/commands/es/indices/cat.js)_

## `kourou es:indices:get INDEX ID`

Gets a document from ES

```
USAGE
  $ kourou es:indices:get INDEX ID

ARGUMENTS
  INDEX  ES Index name
  ID     Document ID

OPTIONS
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --help           show CLI help
```

_See code: [lib/commands/es/indices/get.js](lib/commands/es/indices/get.js)_

## `kourou es:indices:insert INDEX`

Inserts a document directly into ES (will replace if exists)

```
USAGE
  $ kourou es:indices:insert INDEX

ARGUMENTS
  INDEX  ES Index name

OPTIONS
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --body=body      [default: {}] Document body in JSON
  --help           show CLI help
  --id=id          Document ID
```

_See code: [lib/commands/es/indices/insert.js](lib/commands/es/indices/insert.js)_

## `kourou es:migrate`

Migrate all the index from an Elasticsearch (or a file) to another Elasticsearch

```
USAGE
  $ kourou es:migrate

OPTIONS
  --batch-size=batch-size  [default: 1000] How many documents to move in batch per operation
  --dest=dest              (required) Migration destination provider
  --dry-run                Print witch collections will be migrated
  --help                   show CLI help
  --no-interactive         Skip confirmation interactive prompts (perfect for scripting)
  --pattern=pattern        Pattern to match indices to migrate
  --reset                  Reset destination Elasticsearch server
  --scroll=scroll          [default: 30s] Scroll duration for Elasticsearch scrolling
  --src=src                (required) Migration source provider

EXAMPLES
  kourou es:migrate --src http://elasticsearch:9200 --dest ./my-backup --batch-size 2000 --pattern 
  '&myindexes.collection-*'
  kourou es:migrate --src ./my-backup --dest http://elasticsearch:9200 --reset --batch-size 2000 --no-interactive
```

_See code: [lib/commands/es/migrate.js](lib/commands/es/migrate.js)_

## `kourou es:snapshot:create REPOSITORY NAME`

Create a snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:create REPOSITORY NAME

ARGUMENTS
  REPOSITORY  ES repository name
  NAME        ES snapshot name

OPTIONS
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --help           show CLI help
```

_See code: [lib/commands/es/snapshot/create.js](lib/commands/es/snapshot/create.js)_

## `kourou es:snapshot:create-repository REPOSITORY LOCATION`

Create a FS snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:create-repository REPOSITORY LOCATION

ARGUMENTS
  REPOSITORY  ES repository name
  LOCATION    ES snapshot repository location

OPTIONS
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --compress       Compress data when storing them
  --help           show CLI help
```

_See code: [lib/commands/es/snapshot/create-repository.js](lib/commands/es/snapshot/create-repository.js)_

## `kourou es:snapshot:list REPOSITORY`

List all snapshot from a repository acknowledge by an ES instance

```
USAGE
  $ kourou es:snapshot:list REPOSITORY

ARGUMENTS
  REPOSITORY  Name of repository from which to fetch the snapshot information

OPTIONS
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --help           show CLI help
```

_See code: [lib/commands/es/snapshot/list.js](lib/commands/es/snapshot/list.js)_

## `kourou es:snapshot:restore REPOSITORY NAME`

Restore a snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:restore REPOSITORY NAME

ARGUMENTS
  REPOSITORY  ES repository name
  NAME        ES snapshot name

OPTIONS
  -n, --node=node  [default: http://localhost:9200] Elasticsearch server URL
  --help           show CLI help
```

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

_See code: [lib/commands/file/decrypt.js](lib/commands/file/decrypt.js)_

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

_See code: [lib/commands/file/encrypt.js](lib/commands/file/encrypt.js)_

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

_See code: [lib/commands/file/test.js](lib/commands/file/test.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.18/src/commands/help.ts)_

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

_See code: [lib/commands/import.js](lib/commands/import.js)_

## `kourou index:export INDEX`

Exports an index (JSONL or Kuzzle format)

```
USAGE
  $ kourou index:export INDEX

ARGUMENTS
  INDEX  Index name

OPTIONS
  --api-key=api-key        Kuzzle user api-key
  --as=as                  Impersonate a user
  --batch-size=batch-size  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)

  --format=format          [default: jsonl] "jsonl or kuzzle - kuzzle will export in Kuzzle format usable for internal
                           fixtures and jsonl allows to import that data back with kourou

  --help                   show CLI help

  --host=host              [default: localhost] Kuzzle server host

  --password=password      Kuzzle user password

  --path=path              Dump root directory

  --port=port              [default: 7512] Kuzzle server port

  --protocol=protocol      [default: ws] Kuzzle protocol (http or websocket)

  --query=query            [default: {}] Only dump documents in collections matching the query (JS or JSON format)

  --scrollTTL=scrollTTL    [default: 20s] The scroll TTL option to pass to the dump operation (which performs a
                           document.search under the hood),
                           expressed in ms format, e.g. '2s', '1m', '3h'.

  --ssl                    Use SSL to connect to Kuzzle

  --type=type              [default: all] Type of the export: all, mappings, data

  --username=username      [default: anonymous] Kuzzle username (local strategy)

EXAMPLES
  kourou index:export nyc-open-data
  kourou index:export nyc-open-data --query '{"range":{"_kuzzle_info.createdAt":{"gt":1632935638866}}}'
```

_See code: [lib/commands/index/export.js](lib/commands/index/export.js)_

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

_See code: [lib/commands/index/import.js](lib/commands/index/import.js)_

## `kourou instance:kill`

Stop and remove all the containers of a running kuzzle instance

```
USAGE
  $ kourou instance:kill

OPTIONS
  -a, --all                Kill all instances
  -i, --instance=instance  Kuzzle instance name [ex: stack-0]
```

_See code: [lib/commands/instance/kill.js](lib/commands/instance/kill.js)_

## `kourou instance:list`

Lists the Kuzzle running instances

```
USAGE
  $ kourou instance:list
```

_See code: [lib/commands/instance/list.js](lib/commands/instance/list.js)_

## `kourou instance:logs`

Displays the logs of a running Kuzzle

```
USAGE
  $ kourou instance:logs

OPTIONS
  -f, --follow             Follow log output
  -i, --instance=instance  Kuzzle instance name
```

_See code: [lib/commands/instance/logs.js](lib/commands/instance/logs.js)_

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

_See code: [lib/commands/instance/spawn.js](lib/commands/instance/spawn.js)_

## `kourou paas:login`

Login for a PaaS project

```
USAGE
  $ kourou paas:login

OPTIONS
  --help               show CLI help
  --only_npm           Only perform the login on the private NPM registry
  --project=project    Current PaaS project
  --username=username  PaaS username
```

_See code: [lib/commands/paas/login.js](lib/commands/paas/login.js)_

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

_See code: [lib/commands/profile/export.js](lib/commands/profile/export.js)_

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

_See code: [lib/commands/profile/import.js](lib/commands/profile/import.js)_

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

_See code: [lib/commands/realtime/subscribe.js](lib/commands/realtime/subscribe.js)_

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

_See code: [lib/commands/redis/list-keys.js](lib/commands/redis/list-keys.js)_

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

_See code: [lib/commands/role/export.js](lib/commands/role/export.js)_

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

_See code: [lib/commands/role/import.js](lib/commands/role/import.js)_

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

_See code: [lib/commands/sdk/execute.js](lib/commands/sdk/execute.js)_

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

  --print-raw                  Print only the query result to stdout

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

_See code: [lib/commands/sdk/query.js](lib/commands/sdk/query.js)_

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

_See code: [lib/commands/user/export.js](lib/commands/user/export.js)_

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

_See code: [lib/commands/user/export-mappings.js](lib/commands/user/export-mappings.js)_

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

_See code: [lib/commands/user/import.js](lib/commands/user/import.js)_

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

_See code: [lib/commands/user/import-mappings.js](lib/commands/user/import-mappings.js)_

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

_See code: [lib/commands/vault/add.js](lib/commands/vault/add.js)_

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

_See code: [lib/commands/vault/decrypt.js](lib/commands/vault/decrypt.js)_

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

_See code: [lib/commands/vault/encrypt.js](lib/commands/vault/encrypt.js)_

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

_See code: [lib/commands/vault/show.js](lib/commands/vault/show.js)_

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

_See code: [lib/commands/vault/test.js](lib/commands/vault/test.js)_
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

# Telemetry

We use a custom Open Source analytics backend (you can check the code [here](https://github.com/kuzzleio/kepler)) to record the use of Kourou by users.

Collected metrics will allow us to study the use of our products in order to improve them. We do not collect any personal data about users.

You can disable usage metrics collection by setting the `KOUROU_USAGE` environment variable to `false`.

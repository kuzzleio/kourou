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
$ kourou (--version)
kourou/1.5.0 linux-x64 node-v24.20.0
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
* [`kourou version`](#kourou-version)

## `kourou api-key:check TOKEN`

Checks an API key validity

```
USAGE
  $ kourou api-key:check TOKEN [--help] [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password
    <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  TOKEN  API key token

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or ws)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Checks an API key validity

EXAMPLES
  $ kourou api-key:check eyJhbG...QxfQrc
```

_See code: [src/commands/api-key/check.ts](src/commands/api-key/check.ts)_

## `kourou api-key:create USER`

Creates a new API Key for a user

```
USAGE
  $ kourou api-key:create USER -d <value> [--help] [--id <value>] [--expire <value>] [--host <value>] [--port
    <value>] [--ssl] [--username <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  USER  User kuid

FLAGS
  -d, --description=<value>  (required) API Key description
      --api-key=<value>      Kuzzle user api-key
      --as=<value>           Impersonate a user
      --expire=<value>       [default: -1] API Key validity
      --help                 Show CLI help.
      --host=<value>         [default: localhost] Kuzzle server host
      --id=<value>           API Key unique ID
      --password=<value>     Kuzzle user password
      --port=<value>         [default: 7512] Kuzzle server port
      --protocol=<value>     [default: ws] Kuzzle protocol (http or ws)
      --ssl                  Use SSL to connect to Kuzzle
      --username=<value>     [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Creates a new API Key for a user
```

_See code: [src/commands/api-key/create.ts](src/commands/api-key/create.ts)_

## `kourou api-key:delete USER ID`

Deletes an API key.

```
USAGE
  $ kourou api-key:delete USER ID [--help] [--host <value>] [--port <value>] [--ssl] [--username <value>]
    [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  USER  User kuid
  ID    API Key unique ID

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or ws)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Deletes an API key.

EXAMPLES
  $ kourou vault:delete sigfox-gateway 1k-BF3EBjsXdvA2PR8x
```

_See code: [src/commands/api-key/delete.ts](src/commands/api-key/delete.ts)_

## `kourou api-key:search USER`

Lists a user's API Keys.

```
USAGE
  $ kourou api-key:search USER [--help] [--filter <value>] [--host <value>] [--port <value>] [--ssl] [--username
    <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  USER  User kuid

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --filter=<value>    Filter to match the API Key descriptions
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or ws)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Lists a user's API Keys.
```

_See code: [src/commands/api-key/search.ts](src/commands/api-key/search.ts)_

## `kourou app:debug-proxy`

Create a Proxy Server that allows Chrome to debug Kuzzle remotely using the DebugController

```
USAGE
  $ kourou app:debug-proxy [--help] [--forwardPort <value>] [--ttl <value>] [--keepAuth] [--noAutoEnableDebugger]
    [--showDebuggerEvents] [--showDebuggerPayloads] [--host <value>] [--port <value>] [--ssl] [--username <value>]
    [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

FLAGS
  --api-key=<value>       Kuzzle user api-key
  --as=<value>            Impersonate a user
  --forwardPort=<value>   [default: 9222] Port of the forwarding server
  --help                  Show CLI help.
  --host=<value>          [default: localhost] Kuzzle server host
  --keepAuth              Keep the user authenticated
  --noAutoEnableDebugger  True if Kourou should not enable and disable the Debugger automatically before and after usage
  --password=<value>      Kuzzle user password
  --port=<value>          [default: 7512] Kuzzle server port
  --protocol=<value>      [default: ws] Kuzzle protocol (http or ws)
  --showDebuggerEvents    Verbose mode to display events sent to the Chrome Debugger
  --showDebuggerPayloads  Verbose mode to display payloads sent by and to the Chrome Debugger
  --ssl                   Use SSL to connect to Kuzzle
  --ttl=<value>           [default: 1h] Kuzzle login TTL
  --username=<value>      [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Create a Proxy Server that allows Chrome to debug Kuzzle remotely using the DebugController
```

_See code: [src/commands/app/debug-proxy.ts](src/commands/app/debug-proxy.ts)_

## `kourou app:doctor`

Analyze a Kuzzle application

```
USAGE
  $ kourou app:doctor [--help] [--elasticsearch <value>] [--host <value>] [--port <value>] [--ssl] [--username
    <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

FLAGS
  --api-key=<value>        Kuzzle user api-key
  --as=<value>             Impersonate a user
  --elasticsearch=<value>  [default: http://localhost:9200] Elasticsearch server URL
  --help                   Show CLI help.
  --host=<value>           [default: localhost] Kuzzle server host
  --password=<value>       Kuzzle user password
  --port=<value>           [default: 7512] Kuzzle server port
  --protocol=<value>       [default: ws] Kuzzle protocol (http or ws)
  --ssl                    Use SSL to connect to Kuzzle
  --username=<value>       [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Analyze a Kuzzle application
```

_See code: [src/commands/app/doctor.ts](src/commands/app/doctor.ts)_

## `kourou app:scaffold DESTINATION`

Scaffolds a new Kuzzle application

```
USAGE
  $ kourou app:scaffold DESTINATION [--help] [--flavor <value>] [--token <value>]

ARGUMENTS
  DESTINATION  Directory to scaffold the app

FLAGS
  --flavor=<value>  [default: generic] Template flavor ("generic", "iot", "hypervision").
  --help            Show CLI help.
  --token=<value>   GitHub token used to clone private template repositories.
                    Defaults to the GITHUB_TOKEN environment variable, then to the GitHub CLI credentials.

DESCRIPTION
  Scaffolds a new Kuzzle application
```

_See code: [src/commands/app/scaffold.ts](src/commands/app/scaffold.ts)_

## `kourou app:start-services`

Starts Kuzzle services (Elasticsearch and Redis)

```
USAGE
  $ kourou app:start-services [--help] [--check]

FLAGS
  --check  Check prerequisite before running services
  --help   Show CLI help.

DESCRIPTION
  Starts Kuzzle services (Elasticsearch and Redis)
```

_See code: [src/commands/app/start-services.ts](src/commands/app/start-services.ts)_

## `kourou autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ kourou autocomplete [SHELL] [-r]

ARGUMENTS
  [SHELL]  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ kourou autocomplete

  $ kourou autocomplete bash

  $ kourou autocomplete zsh

  $ kourou autocomplete powershell

  $ kourou autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v4.0.0/src/commands/autocomplete/index.ts)_

## `kourou collection:create INDEX COLLECTION [BODY]`

Creates a collection

```
USAGE
  $ kourou collection:create INDEX COLLECTION [BODY] [--help] [--host <value>] [--port <value>] [--ssl] [--username
    <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  [BODY]      Collection mappings and settings in JS or JSON format. Will be read from STDIN if available

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or ws)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Creates a collection
```

_See code: [src/commands/collection/create.ts](src/commands/collection/create.ts)_

## `kourou collection:export INDEX COLLECTION`

Exports a collection (JSONL format)

```
USAGE
  $ kourou collection:export INDEX COLLECTION [--help] [--path <value>] [--batch-size <value>] [--query <value>]
    [--editor] [--format jsonl|kuzzle|csv] [--fields <value>] [--scrollTTL <value>] [--type <value>] [--host <value>]
    [--port <value>] [--ssl] [--username <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key
    <value>]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name

FLAGS
  --api-key=<value>
      Kuzzle user api-key

  --as=<value>
      Impersonate a user

  --batch-size=<value>
      [default: 2000] Maximum batch size (see limits.documentsFetchCount config)

  --editor
      Open an editor (EDITOR env variable) to edit the query before sending

  --fields=<value>
      [CSV format only] The list of fields to be included in the CSV export in dot-path format.

      Example:
      --fields oneField,anotherField,yetAnotherOne.nested.moarNested

      Note that the '_id' field is always included in the CSV export. Leaving this option empty implies that all
      exportable fields in the mapping will be exported.

  --format=<option>
      [default: jsonl] "kuzzle" will export in Kuzzle format usable for internal fixtures,
      "jsonl" allows to import that data back with kourou,
      "csv" allows to import data into Excel (please, specify the fields to export using the --fields option).
      <options: jsonl|kuzzle|csv>

  --help
      Show CLI help.

  --host=<value>
      [default: localhost] Kuzzle server host

  --password=<value>
      Kuzzle user password

  --path=<value>
      Dump root directory

  --port=<value>
      [default: 7512] Kuzzle server port

  --protocol=<value>
      [default: ws] Kuzzle protocol (http or websocket)

  --query=<value>
      [default: {}] Only dump documents matching the query (JS or JSON format)

  --scrollTTL=<value>
      [default: 20s] The scroll TTL option to pass to the dump operation (which performs a document.search under the
      hood),
      expressed in ms format, e.g. '2s', '1m', '3h'.

  --ssl
      Use SSL to connect to Kuzzle

  --type=<value>
      [default: all] Type of the export: all, mappings, data

  --username=<value>
      [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Exports a collection (JSONL format)

EXAMPLES
  $ kourou collection:export nyc-open-data yellow-taxi

  $ kourou collection:export nyc-open-data yellow-taxi --query '{ term: { city: "Saigon" } }'
```

_See code: [src/commands/collection/export.ts](src/commands/collection/export.ts)_

## `kourou collection:import PATH`

Imports a collection

```
USAGE
  $ kourou collection:import PATH [--help] [--batch-size <value>] [--index <value>] [--collection <value>]
    [--no-mappings] [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password <value>] [--protocol
    <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  PATH  Dump directory path

FLAGS
  --api-key=<value>     Kuzzle user api-key
  --as=<value>          Impersonate a user
  --batch-size=<value>  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --collection=<value>  If set, override the collection destination name
  --help                Show CLI help.
  --host=<value>        [default: localhost] Kuzzle server host
  --index=<value>       If set, override the index destination name
  --no-mappings         Skip collection mappings
  --password=<value>    Kuzzle user password
  --port=<value>        [default: 7512] Kuzzle server port
  --protocol=<value>    [default: ws] Kuzzle protocol (http or websocket)
  --ssl                 Use SSL to connect to Kuzzle
  --username=<value>    [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Imports a collection
```

_See code: [src/commands/collection/import.ts](src/commands/collection/import.ts)_

## `kourou collection:migrate SCRIPT PATH`

Migrate a collection by transforming documents from a dump file and importing them into Kuzzle

```
USAGE
  $ kourou collection:migrate SCRIPT PATH [--help] [--batch-size <value>] [--index <value>] [--collection <value>]
    [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password <value>] [--protocol <value>] [--as
    <value>] [--api-key <value>]

ARGUMENTS
  SCRIPT  Migration script path
  PATH    Collection dump path

FLAGS
  --api-key=<value>     Kuzzle user api-key
  --as=<value>          Impersonate a user
  --batch-size=<value>  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --collection=<value>  If set, override the collection destination name
  --help                Show CLI help.
  --host=<value>        [default: localhost] Kuzzle server host
  --index=<value>       If set, override the index destination name
  --password=<value>    Kuzzle user password
  --port=<value>        [default: 7512] Kuzzle server port
  --protocol=<value>    [default: ws] Kuzzle protocol (http or websocket)
  --ssl                 Use SSL to connect to Kuzzle
  --username=<value>    [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Migrate a collection by transforming documents from a dump file and importing them into Kuzzle
```

_See code: [src/commands/collection/migrate.ts](src/commands/collection/migrate.ts)_

## `kourou config:diff FIRST SECOND`

Returns differences between two Kuzzle configuration files (kuzzlerc)

```
USAGE
  $ kourou config:diff FIRST SECOND [--strict] [--values]

ARGUMENTS
  FIRST   First configuration file
  SECOND  Second configuration file

FLAGS
  --strict  Exit with an error if differences are found
  --values  Also displays value changes

DESCRIPTION
  Returns differences between two Kuzzle configuration files (kuzzlerc)

EXAMPLES
  $ kourou config:diff config/local/kuzzlerc config/production/kuzzlerc
```

_See code: [src/commands/config/diff.ts](src/commands/config/diff.ts)_

## `kourou document:search INDEX COLLECTION [QUERY]`

Searches for documents

```
USAGE
  $ kourou document:search INDEX COLLECTION [QUERY] [--sort <value>] [--from <value>] [--size <value>] [--scroll
    <value>] [--lang <value>] [--editor] [--help] [--host <value>] [--port <value>] [--ssl] [--username <value>]
    [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  [QUERY]     Search query in JS or JSON format.

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --editor            Open an editor (EDITOR env variable) to edit the request before sending
  --from=<value>      Optional offset
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --lang=<value>      [default: koncorde] Specify the query language to use
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or ws)
  --scroll=<value>    Optional scroll TTL
  --size=<value>      Optional page size
  --sort=<value>      [default: {}] Sort in JS or JSON format.
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Searches for documents

EXAMPLES
  $ kourou document:search iot sensors '{ equals: { name: "corona" } }'

  $ kourou document:search iot sensors '{ match: { name: "cOrOnna" } }' -a lang=elasticsearch

  $ kourou document:search iot sensors --editor
```

_See code: [src/commands/document/search.ts](src/commands/document/search.ts)_

## `kourou es:aliases:cat`

Lists available ES aliases

```
USAGE
  $ kourou es:aliases:cat [--help] [-n <value>] [-g <value>]

FLAGS
  -g, --grep=<value>  Match output with pattern
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --help          Show CLI help.

DESCRIPTION
  Lists available ES aliases
```

_See code: [src/commands/es/aliases/cat.ts](src/commands/es/aliases/cat.ts)_

## `kourou es:indices:cat`

Lists available ES indexes

```
USAGE
  $ kourou es:indices:cat [--help] [-n <value>] [-g <value>]

FLAGS
  -g, --grep=<value>  Match output with pattern
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --help          Show CLI help.

DESCRIPTION
  Lists available ES indexes
```

_See code: [src/commands/es/indices/cat.ts](src/commands/es/indices/cat.ts)_

## `kourou es:indices:get INDEX ID`

Gets a document from ES

```
USAGE
  $ kourou es:indices:get INDEX ID [--help] [-n <value>]

ARGUMENTS
  INDEX  ES Index name
  ID     Document ID

FLAGS
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --help          Show CLI help.

DESCRIPTION
  Gets a document from ES
```

_See code: [src/commands/es/indices/get.ts](src/commands/es/indices/get.ts)_

## `kourou es:indices:insert INDEX`

Inserts a document directly into ES (will replace if exists)

```
USAGE
  $ kourou es:indices:insert INDEX [--body <value>] [--id <value>] [-n <value>] [--help]

ARGUMENTS
  INDEX  ES Index name

FLAGS
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --body=<value>  [default: {}] Document body in JSON
      --help          Show CLI help.
      --id=<value>    Document ID

DESCRIPTION
  Inserts a document directly into ES (will replace if exists)
```

_See code: [src/commands/es/indices/insert.ts](src/commands/es/indices/insert.ts)_

## `kourou es:migrate`

Migrate all the index from an Elasticsearch (or a file) to another Elasticsearch

```
USAGE
  $ kourou es:migrate --src <value> --dest <value> [--help] [--reset] [--batch-size <value>] [--no-interactive]
    [--dry-run] [--pattern <value>] [--scroll <value>] [--only-mappings] [--esVersion 7|8]

FLAGS
  --batch-size=<value>  [default: 1000] How many documents to move in batch per operation
  --dest=<value>        (required) [env: KUZZLE_MIGRATION_DEST] Migration destination provider
  --dry-run             Print witch collections will be migrated
  --esVersion=<option>  [default: 7] Elasticsearch version to use for the migration
                        <options: 7|8>
  --help                Show CLI help.
  --no-interactive      Skip confirmation interactive prompts (perfect for scripting)
  --only-mappings       Only migrate mappings
  --pattern=<value>     Pattern to match indices to migrate
  --reset               Reset destination Elasticsearch server
  --scroll=<value>      [default: 30s] Scroll duration for Elasticsearch scrolling
  --src=<value>         (required) [env: KUZZLE_MIGRATION_SRC] Migration source provider

DESCRIPTION
  Migrate all the index from an Elasticsearch (or a file) to another Elasticsearch

EXAMPLES
  $ kourou es:migrate --src http://elasticsearch:9200 --dest ./my-backup

  $ kourou es:migrate --src ./my-backup --dest http://elasticsearch:9200

  $ kourou es:migrate --src ./my-backup --dest http://username:password@elasticsearch:9200 --reset

  $ kourou es:migrate --src ./my-backup --dest http://nologin:api-key@elasticsearch:9200 --reset // nologin is a special username that allows you to use an API key as password

  $ kourou es:migrate --src http://elasticsearch:9200 --dest ./my-backup --batch-size 2000 --pattern '&myindexes.collection-*'

  $ kourou es:migrate --src ./my-backup --dest http://elasticsearch:9200 --reset --batch-size 2000 --no-interactive

  $ kourou es:migrate --src ./my-backup --dest http://elasticsearch:9200 --reset --batch-size 2000 --no-interactive --esVersion 8
```

_See code: [src/commands/es/migrate.ts](src/commands/es/migrate.ts)_

## `kourou es:snapshot:create REPOSITORY NAME`

Create a snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:create REPOSITORY NAME [-n <value>] [--wait] [--help]

ARGUMENTS
  REPOSITORY  ES repository name
  NAME        ES snapshot name

FLAGS
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --help          Show CLI help.
      --[no-]wait     Wait for the snapshot to complete before returning. Use --no-wait to return as soon as
                      Elasticsearch has accepted the request

DESCRIPTION
  Create a snapshot repository inside an ES instance
```

_See code: [src/commands/es/snapshot/create.ts](src/commands/es/snapshot/create.ts)_

## `kourou es:snapshot:create-repository REPOSITORY LOCATION`

Create a FS snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:create-repository REPOSITORY LOCATION [--compress] [-n <value>] [--help]

ARGUMENTS
  REPOSITORY  ES repository name
  LOCATION    ES snapshot repository location

FLAGS
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --compress      Compress data when storing them
      --help          Show CLI help.

DESCRIPTION
  Create a FS snapshot repository inside an ES instance
```

_See code: [src/commands/es/snapshot/create-repository.ts](src/commands/es/snapshot/create-repository.ts)_

## `kourou es:snapshot:list REPOSITORY`

List all snapshot from a repository acknowledge by an ES instance

```
USAGE
  $ kourou es:snapshot:list REPOSITORY [-n <value>] [--help]

ARGUMENTS
  REPOSITORY  Name of repository from which to fetch the snapshot information

FLAGS
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --help          Show CLI help.

DESCRIPTION
  List all snapshot from a repository acknowledge by an ES instance
```

_See code: [src/commands/es/snapshot/list.ts](src/commands/es/snapshot/list.ts)_

## `kourou es:snapshot:restore REPOSITORY NAME`

Restore a snapshot repository inside an ES instance

```
USAGE
  $ kourou es:snapshot:restore REPOSITORY NAME [-n <value>] [--wait] [--help]

ARGUMENTS
  REPOSITORY  ES repository name
  NAME        ES snapshot name

FLAGS
  -n, --node=<value>  [default: http://localhost:9200] Elasticsearch server URL
      --help          Show CLI help.
      --[no-]wait     Wait for the restore to complete before returning. Use --no-wait to return as soon as
                      Elasticsearch has accepted the request

DESCRIPTION
  Restore a snapshot repository inside an ES instance
```

_See code: [src/commands/es/snapshot/restore.ts](src/commands/es/snapshot/restore.ts)_

## `kourou file:decrypt FILE`

Decrypts an encrypted file.

```
USAGE
  $ kourou file:decrypt FILE [-f] [-o <value>] [--vault-key <value>]

ARGUMENTS
  FILE  Encrypted file

FLAGS
  -f, --force                Overwrite the output file if it already exists
  -o, --output-file=<value>  Output file (default: remove ".enc")
      --vault-key=<value>    Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Decrypts an encrypted file.

EXAMPLES
  $ kourou file:decrypt books/cryptonomicon.txt.enc --vault-key <vault-key>

  $ kourou file:decrypt books/cryptonomicon.txt.enc -o books/cryptonomicon.txt --vault-key <vault-key>
```

_See code: [src/commands/file/decrypt.ts](src/commands/file/decrypt.ts)_

## `kourou file:encrypt FILE`

Encrypts an entire file.

```
USAGE
  $ kourou file:encrypt FILE [-f] [-o <value>] [--vault-key <value>]

ARGUMENTS
  FILE  Filename

FLAGS
  -f, --force                Overwrite the output file if it already exists
  -o, --output-file=<value>  Output file (default: <filename>.enc)
      --vault-key=<value>    Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Encrypts an entire file.

EXAMPLES
  $ kourou file:encrypt books/cryptonomicon.txt --vault-key <vault-key>

  $ kourou file:encrypt books/cryptonomicon.txt -o books/cryptonomicon.txt.enc --vault-key <vault-key>
```

_See code: [src/commands/file/encrypt.ts](src/commands/file/encrypt.ts)_

## `kourou file:test FILE`

Tests if an encrypted file can be decrypted.

```
USAGE
  $ kourou file:test FILE [--vault-key <value>]

ARGUMENTS
  FILE  Encrypted file

FLAGS
  --vault-key=<value>  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION
  Tests if an encrypted file can be decrypted.

EXAMPLES
  $ kourou file:test books/cryptonomicon.txt.enc --vault-key <vault-key>
```

_See code: [src/commands/file/test.ts](src/commands/file/test.ts)_

## `kourou help [COMMAND]`

Display help for kourou.

```
USAGE
  $ kourou help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for kourou.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/7.0.0/src/commands/help.ts)_

## `kourou import PATH`

Recursively imports dump files from a root directory

```
USAGE
  $ kourou import PATH [--preserve-anonymous] [--help] [--batch-size <value>] [--host <value>] [--port
    <value>] [--ssl] [--username <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  PATH  Root directory containing dumps

FLAGS
  --api-key=<value>     Kuzzle user api-key
  --as=<value>          Impersonate a user
  --batch-size=<value>  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                Show CLI help.
  --host=<value>        [default: localhost] Kuzzle server host
  --password=<value>    Kuzzle user password
  --port=<value>        [default: 7512] Kuzzle server port
  --preserve-anonymous  Preserve anonymous rights
  --protocol=<value>    [default: ws] Kuzzle protocol (http or websocket)
  --ssl                 Use SSL to connect to Kuzzle
  --username=<value>    [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Recursively imports dump files from a root directory
```

_See code: [src/commands/import.ts](src/commands/import.ts)_

## `kourou index:export INDEX`

Exports an index (JSONL or Kuzzle format)

```
USAGE
  $ kourou index:export INDEX [--help] [--path <value>] [--batch-size <value>] [--query <value>] [--format
    <value>] [--scrollTTL <value>] [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password <value>]
    [--protocol <value>] [--as <value>] [--api-key <value>] [--type <value>]

ARGUMENTS
  INDEX  Index name

FLAGS
  --api-key=<value>     Kuzzle user api-key
  --as=<value>          Impersonate a user
  --batch-size=<value>  [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --format=<value>      [default: jsonl] "jsonl or kuzzle - kuzzle will export in Kuzzle format usable for internal
                        fixtures and jsonl allows to import that data back with kourou
  --help                Show CLI help.
  --host=<value>        [default: localhost] Kuzzle server host
  --password=<value>    Kuzzle user password
  --path=<value>        Dump root directory
  --port=<value>        [default: 7512] Kuzzle server port
  --protocol=<value>    [default: ws] Kuzzle protocol (http or websocket)
  --query=<value>       [default: {}] Only dump documents in collections matching the query (JS or JSON format)
  --scrollTTL=<value>   [default: 20s] The scroll TTL option to pass to the dump operation (which performs a
                        document.search under the hood),
                        expressed in ms format, e.g. '2s', '1m', '3h'.
  --ssl                 Use SSL to connect to Kuzzle
  --type=<value>        [default: all] Type of the export: all, mappings, data
  --username=<value>    [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Exports an index (JSONL or Kuzzle format)

EXAMPLES
  $ kourou index:export nyc-open-data

  $ kourou index:export nyc-open-data --query '{"range":{"_kuzzle_info.createdAt":{"gt":1632935638866}}}'
```

_See code: [src/commands/index/export.ts](src/commands/index/export.ts)_

## `kourou index:import PATH`

Imports an index (JSONL format)

```
USAGE
  $ kourou index:import PATH [--help] [--batch-size <value>] [--index <value>] [--no-mappings] [--host <value>]
    [--port <value>] [--ssl] [--username <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key
    <value>]

ARGUMENTS
  PATH  Dump directory or file

FLAGS
  --api-key=<value>     Kuzzle user api-key
  --as=<value>          Impersonate a user
  --batch-size=<value>  [default: 200] Maximum batch size (see limits.documentsWriteCount config)
  --help                Show CLI help.
  --host=<value>        [default: localhost] Kuzzle server host
  --index=<value>       If set, override the index destination name
  --no-mappings         Skip collections mappings
  --password=<value>    Kuzzle user password
  --port=<value>        [default: 7512] Kuzzle server port
  --protocol=<value>    [default: ws] Kuzzle protocol (http or websocket)
  --ssl                 Use SSL to connect to Kuzzle
  --username=<value>    [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Imports an index (JSONL format)

EXAMPLES
  $ kourou index:import ./dump/iot-data

  $ kourou index:import ./dump/iot-data --index iot-data-production --no-mappings
```

_See code: [src/commands/index/import.ts](src/commands/index/import.ts)_

## `kourou instance:kill`

Stop and remove all the containers of a running kuzzle instance

```
USAGE
  $ kourou instance:kill [-i <value>] [-a]

FLAGS
  -a, --all               Kill all instances
  -i, --instance=<value>  Kuzzle instance name [ex: stack-0]

DESCRIPTION
  Stop and remove all the containers of a running kuzzle instance
```

_See code: [src/commands/instance/kill.ts](src/commands/instance/kill.ts)_

## `kourou instance:list`

Lists the Kuzzle running instances

```
USAGE
  $ kourou instance:list

DESCRIPTION
  Lists the Kuzzle running instances
```

_See code: [src/commands/instance/list.ts](src/commands/instance/list.ts)_

## `kourou instance:logs`

Displays the logs of a running Kuzzle

```
USAGE
  $ kourou instance:logs [-i <value>] [-f]

FLAGS
  -f, --follow            Follow log output
  -i, --instance=<value>  Kuzzle instance name

DESCRIPTION
  Displays the logs of a running Kuzzle
```

_See code: [src/commands/instance/logs.ts](src/commands/instance/logs.ts)_

## `kourou instance:spawn`

Spawn a new Kuzzle instance

```
USAGE
  $ kourou instance:spawn [--help] [--check] [-v <value>]

FLAGS
  -v, --version=<value>  [default: 2] Core-version of the instance to spawn
      --check            Check prerequisite before running Kuzzle
      --help             Show CLI help.

DESCRIPTION
  Spawn a new Kuzzle instance
```

_See code: [src/commands/instance/spawn.ts](src/commands/instance/spawn.ts)_

## `kourou paas:login`

Login for a PaaS project

```
USAGE
  $ kourou paas:login [--help] [--project <value>] [--username <value>] [--only_npm]

FLAGS
  --help              Show CLI help.
  --only_npm          Only perform the login on the private NPM registry
  --project=<value>   Current PaaS project
  --username=<value>  PaaS username

DESCRIPTION
  Login for a PaaS project
```

_See code: [src/commands/paas/login.ts](src/commands/paas/login.ts)_

## `kourou profile:export`

Exports profiles

```
USAGE
  $ kourou profile:export [--help] [--path <value>] [--host <value>] [--port <value>] [--ssl] [--username <value>]
    [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --path=<value>      [default: profiles] Dump directory
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or websocket)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Exports profiles
```

_See code: [src/commands/profile/export.ts](src/commands/profile/export.ts)_

## `kourou profile:import PATH`

Imports profiles

```
USAGE
  $ kourou profile:import PATH [--help] [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password
    <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  PATH  Dump file

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or websocket)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Imports profiles
```

_See code: [src/commands/profile/import.ts](src/commands/profile/import.ts)_

## `kourou realtime:subscribe INDEX COLLECTION [FILTERS]`

Subscribes to realtime notifications

```
USAGE
  $ kourou realtime:subscribe INDEX COLLECTION [FILTERS] [--scope <value>] [--users <value>] [--volatile <value>]
    [--display <value>] [--editor] [--help] [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password
    <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  INDEX       Index name
  COLLECTION  Collection name
  [FILTERS]   Set of Koncorde filters

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --display=<value>   [default: result] Path of the property to display from the notification (empty string to display
                      everything)
  --editor            Open an editor (EDITOR env variable) to edit the filters before subscribing.
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: websocket] Kuzzle protocol (only websocket for realtime)
  --scope=<value>     [default: all] Subscribe to document entering or leaving the scope (all, in, out, none)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)
  --users=<value>     [default: all] Subscribe to users entering or leaving the room (all, in, out, none)
  --volatile=<value>  [default: {}] Additional subscription information used in user join/leave notifications

DESCRIPTION
  Subscribes to realtime notifications

EXAMPLES
  $ kourou realtime:subscribe iot-data sensors

  $ kourou realtime:subscribe iot-data sensors '{ range: { temperature: { gt: 0 } } }'

  $ kourou realtime:subscribe iot-data sensors '{ exists: "position" }' --scope out

  $ kourou realtime:subscribe iot-data sensors --users all --volatile '{ clientId: "citizen-kane" }'

  $ kourou realtime:subscribe iot-data sensors --display result._source.temperature
```

_See code: [src/commands/realtime/subscribe.ts](src/commands/realtime/subscribe.ts)_

## `kourou redis:list-keys [MATCH]`

Lists keys stored in Redis

```
USAGE
  $ kourou redis:list-keys [MATCH] [--help] [--remove] [--size <value>] [--max <value>] [--host <value>] [--port
    <value>] [--ssl] [--username <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  [MATCH]  [default: *] Match Redis keys with a pattern

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --max=<value>       [default: -1] Maximum number of page to retrieve (-1 to retrieve everything)
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or ws)
  --remove            Remove matching keys
  --size=<value>      [default: 100] Page size
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Lists keys stored in Redis

EXAMPLES
  $ kourou redis:list-keys "*cluster*"

  $ kourou redis:list-keys "counters/*" --remove
```

_See code: [src/commands/redis/list-keys.ts](src/commands/redis/list-keys.ts)_

## `kourou role:export`

Exports roles

```
USAGE
  $ kourou role:export [--help] [--path <value>] [--host <value>] [--port <value>] [--ssl] [--username <value>]
    [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --path=<value>      [default: roles] Dump directory
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or websocket)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Exports roles
```

_See code: [src/commands/role/export.ts](src/commands/role/export.ts)_

## `kourou role:import PATH`

Import roles

```
USAGE
  $ kourou role:import PATH [--preserve-anonymous] [--help] [--host <value>] [--port <value>] [--ssl] [--username
    <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  PATH  Dump file

FLAGS
  --api-key=<value>     Kuzzle user api-key
  --as=<value>          Impersonate a user
  --help                Show CLI help.
  --host=<value>        [default: localhost] Kuzzle server host
  --password=<value>    Kuzzle user password
  --port=<value>        [default: 7512] Kuzzle server port
  --preserve-anonymous  Preserve anonymous rights
  --protocol=<value>    [default: ws] Kuzzle protocol (http or websocket)
  --ssl                 Use SSL to connect to Kuzzle
  --username=<value>    [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Import roles
```

_See code: [src/commands/role/import.ts](src/commands/role/import.ts)_

## `kourou sdk:execute [CODE]`

Executes arbitrary code.

```
USAGE
  $ kourou sdk:execute [CODE] [--help] [-v <value>...] [--editor] [--keep-alive] [--print-raw] [--host <value>]
    [--port <value>] [--ssl] [--username <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key
    <value>]

ARGUMENTS
  [CODE]  Code to execute. Will be read from STDIN if available.

FLAGS
  -v, --var=<value>...    Additional arguments injected into the code. (eg: --var 'index="iot-data"'
      --api-key=<value>   Kuzzle user api-key
      --as=<value>        Impersonate a user
      --editor            Open an editor (EDITOR env variable) to edit the code before executing it.
      --help              Show CLI help.
      --host=<value>      [default: localhost] Kuzzle server host
      --keep-alive        Keep the connection running (websocket only)
      --password=<value>  Kuzzle user password
      --port=<value>      [default: 7512] Kuzzle server port
      --print-raw         Print only the script result to stdout
      --protocol=<value>  [default: ws] Kuzzle protocol (http or ws)
      --ssl               Use SSL to connect to Kuzzle
      --username=<value>  [default: anonymous] Kuzzle username (local strategy)

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
  $ kourou sdk:query CONTROLLER:ACTION [--help] [-a <value>...] [--body <value>] [--editor] [--body-editor] [-i
    <value>] [-c <value>] [--id <value>] [--display <value>] [--print-raw] [--host <value>] [--port <value>] [--ssl]
    [--username <value>] [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  CONTROLLER:ACTION  Controller and action (eg: "server:now")

FLAGS
  -a, --arg=<value>...      Additional argument. Repeatable. (e.g. "-a refresh=wait_for")
  -c, --collection=<value>  Collection argument
  -i, --index=<value>       Index argument
      --api-key=<value>     Kuzzle user api-key
      --as=<value>          Impersonate a user
      --body=<value>        [default: {}] Request body in JS or JSON format. Will be read from STDIN if available.
      --body-editor         Open an editor (EDITOR env variable) to edit the body before sending.
      --display=<value>     [default: result] Path of the property to display from the response (empty string to display
                            the result)
      --editor              Open an editor (EDITOR env variable) to edit the request before sending.
      --help                Show CLI help.
      --host=<value>        [default: localhost] Kuzzle server host
      --id=<value>          ID argument (_id)
      --password=<value>    Kuzzle user password
      --port=<value>        [default: 7512] Kuzzle server port
      --print-raw           Print only the query result to stdout
      --protocol=<value>    [default: ws] Kuzzle protocol (http or ws)
      --ssl                 Use SSL to connect to Kuzzle
      --username=<value>    [default: anonymous] Kuzzle username (local strategy)

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
  $ kourou user:export [--help] [--path <value>] [--exclude <value>...] [--generate-credentials]
    [--generated-username <value>] [--batch-size <value>] [--host <value>] [--port <value>] [--ssl] [--username <value>]
    [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

FLAGS
  --api-key=<value>             Kuzzle user api-key
  --as=<value>                  Impersonate a user
  --batch-size=<value>          [default: 2000] Maximum batch size (see limits.documentsFetchCount config)
  --exclude=<value>...          Exclude users by matching their IDs with a regexp
  --generate-credentials        Generate credentials with a random password for users
  --generated-username=<value>  [default: _id] User content property used as a username for local credentials
  --help                        Show CLI help.
  --host=<value>                [default: localhost] Kuzzle server host
  --password=<value>            Kuzzle user password
  --path=<value>                [default: users] Dump directory
  --port=<value>                [default: 7512] Kuzzle server port
  --protocol=<value>            [default: ws] Kuzzle protocol (http or websocket)
  --ssl                         Use SSL to connect to Kuzzle
  --username=<value>            [default: anonymous] Kuzzle username (local strategy)

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
  $ kourou user:export-mappings [--help] [--path <value>] [--host <value>] [--port <value>] [--ssl] [--username <value>]
    [--password <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --path=<value>      [default: users] Dump directory
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or websocket)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Exports users collection mappings to JSON.
```

_See code: [src/commands/user/export-mappings.ts](src/commands/user/export-mappings.ts)_

## `kourou user:import PATH`

Imports users

```
USAGE
  $ kourou user:import PATH [--help] [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password
    <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  PATH  Dump file

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or websocket)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Imports users
```

_See code: [src/commands/user/import.ts](src/commands/user/import.ts)_

## `kourou user:import-mappings PATH`

Imports users collection mappings

```
USAGE
  $ kourou user:import-mappings PATH [--help] [--host <value>] [--port <value>] [--ssl] [--username <value>] [--password
    <value>] [--protocol <value>] [--as <value>] [--api-key <value>]

ARGUMENTS
  PATH  Dump file

FLAGS
  --api-key=<value>   Kuzzle user api-key
  --as=<value>        Impersonate a user
  --help              Show CLI help.
  --host=<value>      [default: localhost] Kuzzle server host
  --password=<value>  Kuzzle user password
  --port=<value>      [default: 7512] Kuzzle server port
  --protocol=<value>  [default: ws] Kuzzle protocol (http or websocket)
  --ssl               Use SSL to connect to Kuzzle
  --username=<value>  [default: anonymous] Kuzzle username (local strategy)

DESCRIPTION
  Imports users collection mappings
```

_See code: [src/commands/user/import-mappings.ts](src/commands/user/import-mappings.ts)_

## `kourou vault:add SECRETS-FILE KEY VALUE`

Adds an encrypted key to an encrypted secrets file.

```
USAGE
  $ kourou vault:add SECRETS-FILE KEY VALUE [--vault-key <value>]

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file
  KEY           Path to the key (lodash style)
  VALUE         Value to encrypt

FLAGS
  --vault-key=<value>  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION

  Adds an encrypted key to an encrypted secrets file.

  A new secrets file is created if it does not yet exist.

  Encrypted secrets are meant to be loaded inside an application with Kuzzle Vault.

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.


EXAMPLES
  $ kourou vault:add config/secrets.enc.json aws.s3.keyId b61e267676660c314b006b06 --vault-key <vault-key>
```

_See code: [src/commands/vault/add.ts](src/commands/vault/add.ts)_

## `kourou vault:decrypt FILE`

Decrypts an entire secrets file.

```
USAGE
  $ kourou vault:decrypt FILE [-f] [-o <value>] [--vault-key <value>]

ARGUMENTS
  FILE  File containing encrypted secrets

FLAGS
  -f, --force                Overwrite the output file if it already exists
  -o, --output-file=<value>  Output file (default: remove ".enc")
      --vault-key=<value>    Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION

  Decrypts an entire secrets file.

  Decrypted secrets file must NEVER be committed into the repository.

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.


EXAMPLES
  $ kourou vault:decrypt config/secrets.enc.json --vault-key <vault-key>

  $ kourou vault:decrypt config/secrets.enc.json -o config/secrets.json --vault-key <vault-key>
```

_See code: [src/commands/vault/decrypt.ts](src/commands/vault/decrypt.ts)_

## `kourou vault:encrypt FILE`

Encrypts an entire secrets file.

```
USAGE
  $ kourou vault:encrypt FILE [-f] [-o <value>] [--vault-key <value>]

ARGUMENTS
  FILE  File containing unencrypted secrets

FLAGS
  -f, --force                Overwrite the output file if it already exists
  -o, --output-file=<value>  Output file (default: <file>.enc.json)
      --vault-key=<value>    Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

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
  $ kourou vault:encrypt config/secrets.json --vault-key <vault-key>

  $ kourou vault:encrypt config/secrets.json -o config/secrets_prod.enc.json --vault-key <vault-key>
```

_See code: [src/commands/vault/encrypt.ts](src/commands/vault/encrypt.ts)_

## `kourou vault:show SECRETS-FILE [KEY]`

Prints an encrypted secrets file content.

```
USAGE
  $ kourou vault:show SECRETS-FILE [KEY] [--vault-key <value>]

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file
  [KEY]         Path to a key (lodash style)

FLAGS
  --vault-key=<value>  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION

  Prints an encrypted secrets file content.

  This method can display either:
  - the entire content of the secrets file
  - a single key value

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.


EXAMPLES
  $ kourou vault:show config/secrets.enc.json --vault-key <vault-key>

  $ kourou vault:show config/secrets.enc.json aws.s3.secretKey --vault-key <vault-key>
```

_See code: [src/commands/vault/show.ts](src/commands/vault/show.ts)_

## `kourou vault:test SECRETS-FILE`

Tests if an encrypted secrets file can be decrypted.

```
USAGE
  $ kourou vault:test SECRETS-FILE [--vault-key <value>]

ARGUMENTS
  SECRETS-FILE  Encrypted secrets file

FLAGS
  --vault-key=<value>  Kuzzle Vault Key (or KUZZLE_VAULT_KEY)

DESCRIPTION

  Tests if an encrypted secrets file can be decrypted.

  See https://github.com/kuzzleio/kuzzle-vault/ for more information.


EXAMPLES
  $ kourou vault:test config/secrets.enc.json --vault-key <vault-key>
```

_See code: [src/commands/vault/test.ts](src/commands/vault/test.ts)_

## `kourou version`

```
USAGE
  $ kourou version [--json] [--verbose]

FLAGS
  --verbose  Show additional information about the CLI.

GLOBAL FLAGS
  --json  Format output as json.

FLAG DESCRIPTIONS
  --verbose  Show additional information about the CLI.

    Additionally shows the architecture, node version, operating system, and versions of plugins that the CLI is using.
```

_See code: [@oclif/plugin-version](https://github.com/oclif/plugin-version/blob/3.0.0/src/commands/version.ts)_
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

# <%= appName %>

_An application running with [Kuzzle](https://github.com/kuzzleio/kuzzle)_

## Development

### Installation

The command `kourou app:scaffold` takes care of installing dependencies for you, so you shouldn't need to worry about it.

However, if for some reason you need to reinstall dependencies (or add new ones), then you can easily do so by running the following command:

`npm run install:docker`

This command installs the dependencies listed in the `package.json` file of this project, inside the docker image. Since some dependencies are written in C or in C++ and compiled, installing in the target docker image ensures that there won't be incompatibility problems if your current system is different from the one used by docker to execute Kuzzle.

### Run

You can use the following command  to run your application in development mode:

`npm run dev:docker`

The application will be reloaded whenever the code changes.

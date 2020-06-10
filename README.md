# Databyss

Expressive database management tools for writers and researchers.

[![CircleCI](https://circleci.com/gh/databyss-org/databyss/tree/master.svg?style=svg)](https://circleci.com/gh/databyss-org/databyss/tree/master)

**If you're a new developer working on the project,**  
please see our [CONTRIBUTING](CONTRIBUTING.md) guide.

## Packages

- [databyss-documentation](packages/databyss-documentation)
- [databyss-login](packages/databyss-login)
- [databyss-notes](packages/databyss-notes)
- [databyss-notes-native](packages/databyss-notes-native)
- [databyss-services](packages/databyss-services)
- [databyss-stories-native](packages/databyss-stories-native)
- [databyss-ui](packages/databyss-ui)

## Available Scripts

### Sandbox Development

`> yarn styleguide`  
Starts the [Styleguidist](https://react-styleguidist.js.org/) server and makes the styleguide available at: http://localhost:6060

`> yarn storybook`  
Starts the [Storybook](https://storybook.js.org/) server and make the Storybook Demo site available at: http://localhost:6006

`> yarn metro:stories`  
Starts a [Metro](https://facebook.github.io/metro/) bundler/server for the native Storybook demo app. After running this, launch the app in XCode or Android Studio to run.

### Starting Apps and Servers

`> yarn start`  
Used during deploy to launch the service specific to `NPM_DEPLOY_TARGET` and will have no effect if run locally.  
cf [Deployment Builds](#deployment-builds)

`> yarn start:docs`  
Runs the [Docusaurus](https://docusaurus.io/) server on port `3000`

`> yarn start:notes`  
Runs the Webpack dev server for the notes web app (`/packages/databyss-notes`). Also builds a static version of `packages/databyss-login`. If you need to do development on the login app, use `yarn start:login`. _NOTE_: unless you have configured it to use a remote API, this app depends on a local instance of the API server to be running. See `yarn start:server`.

`> yarn start:login`  
Runs the Webpack dev server for the login web app (`/packages/databyss-login`).

`> yarn metro:notes`  
Runs the [Metro](https://facebook.github.io/metro/) bundler for developing the notes native app (`/packages/databyss-notes-native`). Run this before running the app in the iOS or Android simulators.

`> yarn start:server`  
Runs the API server from `@databyss-org/databyss-api` on port `5000`.

`> yarn start:server:test`
Like `start:server`, but connects to the TEST database instead of the BETA database.  
cf `seed:testdb`

`> yarn seed:testdb`  
Deletes the TEST database and resets it with some sample data. You must run `start:server:test` before running this.

### Testing

`> yarn lint`
This runs `eslint` on the entire codebase and reports problems.

`> yarn test`  
Runs the linter and the [Jest](https://jestjs.io/) test runner in the interactive watch mode. It is a good idea to have this running while you develop to catch problems and ensure everything is passing before you make a PR.  
cf [Contributing doc](CONTRIBUTING.md#writing-tests)

`> yarn cy`  
Runs the [Cypress](https://www.cypress.io) test runner in interactive watch mode. Like `yarn:test`, it's a good idea to have this running if you're working on UI tasks.

`> yarn cy:test`  
Runs all of the Cypress tests from `yarn cy` but in a headless (text-only) mode.

`> yarn cy:open`  
Used internally by `yarn cy` to open the Cypress test runner interface.

`> yarn cy:run`  
Used internally by `yarn cy:test` to start the test runner.

`yarn cy:run:debug`  
Same as `yarn cy:run`, except it emits verbose debugging logs. To use, run it after running `yarn storybook:cy`.

`yarn storybook:cy`  
Starts the Storybook server, which Cypress hits to access sandboxed UIs to test (like the editor). Called internally by `yarn cy` and `yarn cy:test`.

`test:selenium`
Starts the Selenium tests using the Sauce Labs remote environment

`test:selenium:local`
Starts the Selenium tests in the local environment. The tests use `safari` webdriver. Must specify selenium test string with command with `-t` flag. Configurations can be made in the Sauce Labs [config file](packages/databyss-ui/lib/saucelabs.js)

### Utilities

`> yarn sync-versions`  
This updates the versions of all of the workspaces sub-packages to match the version in the root-level `package.json`. Run this after bumping the version. See [CONTRIBUTING](CONTRIBUTING.md) for more about versioning.

### Building

`> yarn build`  
Used during deploy to build the service specific to `NPM_DEPLOY_TARGET` and will have no effect if run locally.  
cf [Deployment Builds](#deployment-builds)

`> yarn build:ui`  
Builds `databyss-ui` to `/dist` directory  
cf the `databyss-ui` [Getting Started](packages/databyss-ui/README.md#getting-started) section for more.

`> yarn storybook:build`  
Builds Storybook site to `/build` directory

`> yarn styleguide:build`  
Builds Styleguidist site to `/build` directory

## Deployment Builds

Runs `scripts/build.sh`, which looks for a deploy target set in the `NPM_DEPLOY_TARGET` environment variables.

- If the variable's value is `STYLEGUIDE`, it runs [yarn styleguide:build](#yarn-styleguidebuild).
- If the variable's value is `DEMO`, it runs [yarn storybook:build](#yarn-storybookbuild).
- If the variable's value is `NOTES_APP`, it builds the notes web app (`/packages/databyss-notes`).
- If the variable's value is `API_SERVER`, it builds the API (`/packages/databyss-api`).

This is useful for deploying to a host that runs `yarn build` and then serves a static website from the `/build` directory, which is how our Heroku styleguide and module demo servers are configured.

## Big Thanks

Cross-browser Testing Platform and Open Source ❤️ provided by <a href="https://saucelabs.com">
<img alt="Sauce Labs" src="./public/sauce.png" width="100"/>
</a>.

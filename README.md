# databyss project

A collection of packages that drive the databyss platform.

[![CircleCI](https://circleci.com/gh/databyss-org/databyss/tree/master.svg?style=svg)](https://circleci.com/gh/databyss-org/databyss/tree/master)

**If you're a new developer working on the project,**  
please see our [CONTRIBUTING](CONTRIBUTING.md) guide.

## Table of Contents

- [Packages](#packages)
- [Available Scripts](#available-scripts)
  - [yarn notes-native](#yarn-notes-native)
  - [yarn build](#yarn-build)
  - [yarn build:ui](#yarn-buildui)
  - [yarn flow](#yarn-flow)
  - [yarn styleguide](#yarn-styleguide)
  - [yarn styleguide:build](#yarn-styleguidebuild)
  - [yarn storybook](#yarn-storybook)
  - [yarn storybook:build](#yarn-storybookbuild)
  - [yarn lint](#yarn-lint)
  - [yarn test](#yarn-test)
  - [yarn sync-versions](#yarn-sync-versions)

## Packages

- [databyss-ui](packages/databyss-ui)
- [databyss-notes-native](packages/databyss-notes-native)

## Available Scripts

In the project directory, you can run:

### `yarn notes-native`

Runs the Metro bundler for developing the notes-native app. Run this before running the app in the iOS or Android simulators.

### `yarn build`

Runs `scripts/build.sh`, which looks for a deploy target set in the `NPM_DEPLOY_TARGET` environment variables.

- If the variable's value is `STYLEGUIDE`, it runs [yarn styleguide:build](#yarn-styleguidebuild).
- If the variable's value is `DEMO`, it runs [yarn storybook:build](#yarn-storybookbuild).

This is useful for deploying to a host that runs `yarn build` and then serves a static website from the `/build` directory, which is how our Heroku styleguide and module demo servers are configured.

### `yarn build:ui`

Builds the `@databyss-org/databyss-ui` package to the `/dist` directory for distribution. See the `databyss-ui` [Getting Started](packages/databyss-ui/README.md#getting-started) section for more.

### `yarn styleguide`

This will start the [Styleguidist](https://react-styleguidist.js.org/) server and make the styleguide available at: http://localhost:6060

Styleguidist combines a style guide, where all your components are presented on a single page with their props documentation and usage examples, with an environment for developing components in isolation, similar to Storybook. In Styleguidist you write examples in Markdown, where each code snippet is rendered as a live editable playground.

### `yarn styleguide:build`

This builds the Styleguidist styleguide to a static site that you can publish.

### `yarn storybook`

This will start the [Storybook](https://storybook.js.org/) server and make the Storybook Demo site available at: http://localhost:6006

### `yarn storybook:build`

This builds the Storybook app to a static site that you can publish.

### `yarn lint`

This runs `eslint` on the codebase and reports problems. See also [Linting](#linting)

### `yarn test`

Runs the linter and the [Jest](https://jestjs.io/) test runner in the interactive watch mode. It is a good idea to have this running while you develop to catch problems and ensure everything is passing before you make a PR.

Learn more about writing tests in the [Contributing doc](CONTRIBUTING.md#writing-tests)

### `yarn sync-versions`

This updates the versions of all of the workspaces sub-packages to match the version in the root-level `package.json`. Run this after bumping the version. See [CONTRIBUTING](CONTRIBUTING.md) for more about versioning.

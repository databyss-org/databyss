# Contributing

Welcome to the Databyss team. We're happy you are present, although [presence has been deconstructed](http://www.returntocinder.com/motif/presence) so [question](https://databyssorg.slack.com) everything you see here!

## Table of Contents

- [Getting Started](#getting-started)
- [Setup Checklist](#setup-checklist)
- [Coding Style](#coding-style)
- [Writing Tests](#writing-tests)
- [Working on Native Apps](#working-on-native-apps)
  - [Xcode](#xcode)
  - [Android](#android)
- [Adding Native Apps](#adding-native-apps)
- [Environment Variables](#environment-variables)
  - [Summary of Environment files in Use](#summary-of-environment-files-in-use)
  - [Adding Development Environment Variables](#adding-development-environment-variables)
  - [Environment Variables in Client Apps](#environment-variables-in-client-apps)
  - [Expanding Environment Variables In `.env`](#expanding-environment-variables-in-env)
  - [Local-only Environment Variables](#local-only-environment-variables)

## Getting started

Always work from a local fork, include your GitHub name in the branch name, and submit changes via pull request:

1.  Fork the databyss repository on Github
2.  Clone your fork to your local machine `git clone git@github.com:<your-name>/databyss.git`
3.  Follow the [Setup Checklist](#setup-checklist)
4.  Create a branch `git checkout -b <your-name>/<your-feature>`
5.  Make your changes, lint, then push to to GitHub with `git push --set-upstream origin <your-name>/<your-feature>`.
6.  Visit GitHub and make your pull request.

## Setup checklist

- [ ] Run `yarn` in the package root to install all the dependencies
- [ ] Ensure that all of the [local environment variables](#local-environment-variables) are defined in `.env.development.local`. Ask for help on the [#dev channel](https://databyssorg.slack.com/#dev) if you need it.
- [ ] If you are developing on the Native apps, follow the [Working on Native Apps](#working-on-native-apps) guide.
- [ ] Use the [available scripts](README.md#available-scripts) to run or build an app or library

## Coding style

Please follow the coding style and directory patterns of the current codebase. We use eslint, so if possible, enable linting in your editor to get real-time feedback. The linting rules are also run when Webpack recompiles your changes, and can be run manually with `yarn lint`. You should run `yarn lint` and fix any problems _before_ submitting your pull request.

We also use `prettier` rules to maintain consistent, readable code. Try to enable prettier linting and "format on save" if you can for more real-time feedback.

## Writing tests

You may write unit tests for your code and components by creating `*.test.js` files anywhere within the repo. For functional testing, we use [StoryShots](https://storybook.js.org/testing/structural-testing/). This creates [Jest snapshots](https://jestjs.io/docs/en/snapshot-testing) for any Storybook story defined in the codebase.

Please familiarize yourself with [Storybook](https://storybook.js.org/) and create stories for your work if you are working on a _module_. For example, the [Landing](packages/skilltype-ui/modules/Landing/Landing.js) component is a _module_ because it represents a route in the app that renders "fullscreen" - so in other words a "screen unit" of the app.

During testing, StoryShot renders the story to HTML and compares the rendered markup to the markup in the snapshot stored from an earlier test run. If you review the differences and everything looks ok, it give you a chance to confirm the changes and update the snapshot. You must do this before submitting your PR, because the CI will reject the changes if the snapshots are out of date.

## Working on native apps

We use React Native and Metro to build native apps that use our shared UI primitives and components. Before developing, please ensure that you have all of the pre-requisites for developing a (non-Expo) React Native app in the [React Native CLI Quickstart](https://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies)

### Xcode

1.  In terminal, change to the native app directory, which should be `/packages/[native app package]/ios`
2.  Run `pod install` (you may need to install CocoaPods first)
3.  In Xcode, open the Xcode workspace for the app, which is the app directory from step 1
4.  In terminal, change to the root directory of the repo and run `yarn metro:[native app name]` (see [README](README.md) for available `metro:` commands)
5.  In Xcode, choose an emulator and click "Run" (play button)

### Android

1.  In Android studio, open the project for the app, which is the directory `/packages/[native app package]/android`
2.  Run the project (play button) and choose an emulator if needed (SDK 29 or greater)
3.  If you get an error that `keystore.debug` is not found, download it from https://raw.githubusercontent.com/facebook/react-native/master/template/android/app/debug.keystore and put it in the `/packages/[native app package]/android/app` directory.

## Adding native apps

- [ ] _Outside_ of the project repo, follow the [React Native CLI Quickstart](https://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies) instructions to create a new app.

_NOTE_: Because the React Native module is shared for all workspaces in the monorepo, you must specify the version: `react-native init AwesomeApp --version X.XX.X` (use the version from `package.json`)

- [ ] Remove `node_modules` directory and `yarn.lock` from the new native app directory

- [ ] Move the new native app to a directory within `/packages`

- [ ] Remove local config files because we want to inherit the global configs for the monorepo:

  - [ ] Remove `.eslintrc.js`
  - [ ] Remove `.flowconfig`
  - [ ] Remove `.gitattributes`
  - [ ] Remove `.gitignore`

- [ ] Replace `package.json` with the one from `databyss-notes-native` and update the package name.

- [ ] Run `yarn` from the root directory of the repo

- [ ] Replace `metro.config.js` with the one from `/packages/databyss-notes-native`

- [ ] In the root `package.json`, copy the `scripts` entry for `metro:notes`, rename it to `metro:[app name]` and change `databyss-notes-native` to your app directory name

_NOTE_: When running the Android app, you may get an error about a missing keystore file. You can [download it here](https://raw.githubusercontent.com/facebook/react-native/master/template/android/app/debug.keystore) and put it in the `app` directory within the native app package directory.

## Environment variables

We use the [dotenv](https://www.npmjs.com/package/dotenv) package to coordinate environment configurations, with a convention based on the one used by [create-react-app](https://github.com/facebook/create-react-app).

### Summary of Environment Files in Use

- `.env`: Default, loaded for all environments, in source control
- `.env.local`: Local overrides, loaded for all environments except test, not in source control
- `.env.development`, `.env.test`, `.env.production`: Environment-specific settings, in source control
- `.env.development.local`, `.env.test.local`, `.env.production.local`: Local overrides of environment-specific settings, not in source control

Files on the left have more priority than files on the right:

- `yarn start:*`: `.env.development.local`, `.env.development`, `.env.local`, `.env`
- `yarn build:*`: `.env.production.local`, `.env.production`, `.env.local`, `.env`
- `yarn test:*`: `.env.test.local`, `.env.test`, `.env` (note `.env.local` is missing)

### Adding Development Environment Variables

To define permanent environment variables, edit the `.env.development` in the root of your project. If the value is sensitive and shouldn't be in source control, leave it blank as a template, add the sensitive key and value to `.env.development.local`, and make a note of it below in [Local-only Environment Variables](#local-only-environment-variables).

`.env` files **should be** checked into source control (with the exclusion of `.env*.local`).

### Environment Variables in Client Apps

For variables intended to be read in a client app (e.g. not run by node on the server), you must create custom environment variables beginning with `REACT_APP_`. Any other variables except `NODE_ENV` will be ignored to avoid [accidentally exposing a private key on the machine that could have the same name](https://github.com/facebookincubator/create-react-app/issues/865#issuecomment-252199527). Changing any environment variables will require you to restart the development server if it is running.

These environment variables will be defined for you on `process.env`. For example, having an environment
variable named `REACT_APP_SECRET_CODE` will be exposed in your JS as `process.env.REACT_APP_SECRET_CODE`.

### Expanding Environment Variables In `.env`

Expand variables already on your machine for use in your `.env` file (using [dotenv-expand](https://github.com/motdotla/dotenv-expand)).

For example, to get the environment variable `npm_package_version`:

```
REACT_APP_VERSION=$npm_package_version
# also works:
# REACT_APP_VERSION=${npm_package_version}
```

Or expand variables local to the current `.env` file:

```
DOMAIN=www.example.com
REACT_APP_FOO=$DOMAIN/foo
REACT_APP_BAR=$DOMAIN/bar
```

### Local-only Environment Variables

The following environment vars are sensitive and should only be defined in `.env*.local` files. You must populate before running certain apps within the repo:

```
MONGO_URI
SENDGRID_API_KEY
API_BUGSNAG_KEY
```

## Happy coding!

See you on the [Slack](https://databyssorg.slack.com/#dev)

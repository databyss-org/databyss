# databyss project

A collection of packages that drive the databyss platform.

## Table of Contents

- [Packages](#packages)
- [Available Scripts](#available-scripts)
  - [yarn build](#yarn-build)
  - [yarn build:ui](#yarn-build-ui)
  - [yarn flow](#yarn-flow)
  - [yarn styleguide](#yarn-styleguide)
  - [yarn styleguide:build](#yarn-styleguide-build)
  - [yarn storybook](#yarn-storybook)
  - [yarn storybook:build](#yarn-storybook-build)
  - [yarn lint](#yarn-lint)
- [Supported Language Features and Polyfills](#supported-language-features-and-polyfills)
- [Linting](#liniting)

## Packages

- [databyss-ui](packages/databyss-ui)
- [databyss-core](packages/databyss-core)

## Available Scripts

In the project directory, you can run:

### `yarn build`

Runs `scripts/build.sh`, which looks for a deploy target set in the `NPM_DEPLOY_TARGET` environment variables.
* If the variable's value is `STYLEGUIDE`, it runs [yarn styleguide:build](#yarn-styleguide-build).
* If the variable's value is `DEMO`, it runs [yarn storybook:build](#yarn-storybook-build).

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

#### Demo Usage

We use Storybook to demo our modules. To load the table of contents, browse to http://localhost:6006. Then, once you're on a module, add `iframe.html` before the query string to load a standalone version of the module. This is necessary, for example, when testing or demoing a module on mobile, where the IFRAME interface will interfere with fullscreen functionality.

#### Demo URL Example

If the URL in the Storybook interface is  
`https://localhost:6006/?selectedKind=Profile&selectedStory=Edit%20Profile&full=1&addons=0&stories=1&panelRight=0`  
then the standalone demo URL would be
`https://localhost:6006/iframe.html?selectedKind=Profile&selectedStory=Edit%20Profile&full=1&addons=0&stories=1&panelRight=0`

### `yarn storybook:build`

This builds the Storybook app to a static site that you can publish.

## Supported Language Features and Polyfills

This project supports a superset of the latest JavaScript standard.<br>
In addition to [ES6](https://github.com/lukehoban/es6features) syntax features, it also supports:

- [Exponentiation Operator](https://github.com/rwaldron/exponentiation-operator) (ES2016).
- [Async/await](https://github.com/tc39/ecmascript-asyncawait) (ES2017).
- [Object Rest/Spread Properties](https://github.com/sebmarkbage/ecmascript-rest-spread) (stage 3 proposal).
- [Dynamic import()](https://github.com/tc39/proposal-dynamic-import) (stage 3 proposal)
- [Class Fields and Static Properties](https://github.com/tc39/proposal-class-public-fields) (part of stage 3 proposal).
- [JSX](https://facebook.github.io/react/docs/introducing-jsx.html) and [Flow](https://flowtype.org/) syntax.

Note that **the project includes a few ES6 [polyfills](https://en.wikipedia.org/wiki/Polyfill)**:

- [`Object.assign()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) via [`object-assign`](https://github.com/sindresorhus/object-assign).
- [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) via [`promise`](https://github.com/then/promise).
- [`fetch()`](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) via [`whatwg-fetch`](https://github.com/github/fetch).

If you use any other ES6+ features that need **runtime support** (such as `Array.from()` or `Symbol`), make sure you are including the appropriate polyfills manually, or that the browsers you are targeting already support them.

Also note that using some newer syntax features like `for...of` or `[...nonArrayValue]` causes Babel to emit code that depends on ES6 runtime features and might not work without a polyfill. When in doubt, use [Babel REPL](https://babeljs.io/repl/) to see what any specific syntax compiles down to.

## Linting

This project uses [ESLint](https://eslint.org/) to maintain a consist and valid codebase. We have chosen to base our linting rules on [Airnb's js styleguide](https://github.com/airbnb/javascript) and [Prettier](https://prettier.io/docs/en/index.html), but have added some of our own rules in `.eslintrc`.

If you need to deviate from the rules, try to use [inline comments](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments). If you believe a rule should be changed globally, make the change in `.eslintrc`. In either case, please add a comment explaining your reason for changing the linting rule.

You might want to integrate Prettier in your favorite editor. Read the section on [Editor Integration](https://prettier.io/docs/en/editors.html) on the Prettier GitHub page.

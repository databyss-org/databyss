# databyss project

A collection of packages that drive the databyss platform.

## Table of Contents

- [Packages](#packages)
- [Available Scripts](#available-scripts)
- [Supported Language Features and Polyfills](#supported-language-features-and-polyfills)
- [Syntax Highlighting in the Editor](#syntax-highlighting-in-the-editor)
- [Code Splitting](#code-splitting)

## Packages

- [databyss-ui](packages/databyss-ui)

## Available Scripts

In the project directory, you can run:

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

Learn more about [different proposal stages](https://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-).

While we recommend using experimental proposals with some caution, Facebook heavily uses these features in the product code, so we intend to provide [codemods](https://medium.com/@cpojer/effective-javascript-codemods-5a6686bb46fb) if any of these proposals change in the future.

Note that **the project only includes a few ES6 [polyfills](https://en.wikipedia.org/wiki/Polyfill)**:

- [`Object.assign()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) via [`object-assign`](https://github.com/sindresorhus/object-assign).
- [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) via [`promise`](https://github.com/then/promise).
- [`fetch()`](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) via [`whatwg-fetch`](https://github.com/github/fetch).

If you use any other ES6+ features that need **runtime support** (such as `Array.from()` or `Symbol`), make sure you are including the appropriate polyfills manually, or that the browsers you are targeting already support them.

Also note that using some newer syntax features like `for...of` or `[...nonArrayValue]` causes Babel to emit code that depends on ES6 runtime features and might not work without a polyfill. When in doubt, use [Babel REPL](https://babeljs.io/repl/) to see what any specific syntax compiles down to.

## Linting

This project uses [ESLint](https://eslint.org/) to maintain consistent formatting throughout the source code. We have chosen to base our style rules on [Airnb's js styleguide](https://github.com/airbnb/javascript) and [Prettier](https://prettier.io/docs/en/index.html), but have added some of our own rules in `.eslintrc`.

If you change this, first try to use [inline comments](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments). If you need to disable something globally in `.eslintrc`, please add a comment there explaining your reason.

You might want to integrate Prettier in your favorite editor. Read the section on [Editor Integration](https://prettier.io/docs/en/editors.html) on the Prettier GitHub page.

## Syntax Highlighting in the Editor

To configure the syntax highlighting in your favorite text editor, head to the [relevant Babel documentation page](https://babeljs.io/docs/editors) and follow the instructions. Some of the most popular editors are covered.

## Code Splitting

Instead of downloading the entire app before users can use it, code splitting allows you to split your code into small chunks which you can then load on demand.

This project setup supports code splitting via [dynamic `import()`](http://2ality.com/2017/01/import-operator.html#loading-code-on-demand). Its [proposal](https://github.com/tc39/proposal-dynamic-import) is in stage 3. The `import()` function-like form takes the module name as an argument and returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) which always resolves to the namespace object of the module.

Here is an example:

### `moduleA.js`

```js
const moduleA = 'Hello'

export { moduleA }
```

### `App.js`

```js
import React, { Component } from 'react'

class App extends Component {
  handleClick = () => {
    import('./moduleA')
      .then(({ moduleA }) => {
        // Use moduleA
      })
      .catch(err => {
        // Handle failure
      })
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Load</button>
      </div>
    )
  }
}

export default App
```

This will make `moduleA.js` and all its unique dependencies as a separate chunk that only loads after the user clicks the 'Load' button.

You can also use it with `async` / `await` syntax if you prefer it.

### With React Router

[This tutorial](http://serverless-stack.com/chapters/code-splitting-in-create-react-app.html) on how to use code splitting with React Router. You can find the companion GitHub repository [here](https://github.com/AnomalyInnovations/serverless-stack-demo-client/tree/code-splitting-in-create-react-app).

Also check out the [Code Splitting](https://reactjs.org/docs/code-splitting.html) section in React documentation.

## Can I Use Decorators?

Many popular libraries use [decorators](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) in their documentation.<br>
We don't support decorator syntax at the moment because:

- It is an experimental proposal and is subject to change.
- The current specification version is not officially supported by Babel.
- If the specification changes, we won’t be able to write a codemod because we don’t use them internally at Facebook.

However in many cases you can rewrite decorator-based code without decorators just as fine.<br>
Please refer to these two threads for reference:

- [#214](https://github.com/facebookincubator/create-react-app/issues/214)
- [#411](https://github.com/facebookincubator/create-react-app/issues/411)

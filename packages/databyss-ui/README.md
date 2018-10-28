# databyss-ui

This is a component and module library for databyss applications.

The goals of the package are

- to allow application developers to easily build new applications or features
- and to provide, through documented recommendations and examples, standards of semantics, aesthetics and accessibility across all databyss applications.

Component library docs are available at  
https://databyss-styleguide.herokuapp.com

Module demos are available at  
https://databyss-stories.herokuapp.com

## Table of Contents

- [Getting Started](#getting-started)
- [JSS](#jss)
- [Adding Images and Files](#adding-images-and-files)

## Getting Started

To use `databyss-ui` components or modules in your project, you may import them in one of two ways.

If your ES6 configuration doesn't match that of the `databyss-ui` package, use the following format to import components pre-transpiled with `babel-preset-env`:
```js
import { BackButton } from '@databyss-org/databyss-ui';
```

If you want to import the components directory, without any transpile stage, use this format:
```js
import PageHeading from '@databyss-org/databyss-ui/components/Heading/PageHeading';
```

You'll also need to wrap your components in a `ThemeProvider` component from the `react-jss` package:
```js
import { theme } from '@databyss-org/databyss-ui';
export default () => (
  <ThemeProvider theme={theme}>
    <PageHeading>Jacques Derrida on "Abyss"</PageHeading>
  </ThemeProvider>
);
```

Alternatively, if you're render a fullscreen module or component, you can use the `ThemedViewport` component, which uses the default theme if none is specified:
```js
import { ThemedViewport } from '@databyss-org/databyss-ui';
export default () => (
  <ThemedViewport>
    <PageHeading>Jacques Derrida on "Abyss"</PageHeading>
  </ThemedViewport>
);
```

## JSS

The databyss-ui package uses [JSS](http://cssinjs.org) and [react-jss](https://github.com/cssinjs/react-jss) for rendering styles and managing themes.

Shared themes variables and macros are in `src/shared-styles`.

## Adding Images and Files

With Webpack, using static assets like images works similarly to CSS.

You can **`import` a file right in a JavaScript module**. This tells Webpack to include that file in the bundle. Unlike CSS imports, importing a file gives you a string value. This value is the final path you can reference in your code, e.g. as the `src` attribute of an image or the `href` of a link to a PDF.

To reduce the number of requests to the server, importing images that are less than 10,000 bytes returns a [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) instead of a path. This applies to the following file extensions: bmp, gif, jpg, jpeg, and png. SVG files are excluded due to [#1153](https://github.com/facebookincubator/create-react-app/issues/1153).

Here is an example:

```js
import React from 'react'
import logo from './logo.png' // Tell Webpack this JS file uses this image

console.log(logo) // /logo.84287d09.png

function Header() {
  // Import result is the URL of your image
  return <img src={logo} alt="Logo" />
}

export default Header
```

This ensures that when the project is built, Webpack will correctly move the images into the build folder, and provide us with correct paths.

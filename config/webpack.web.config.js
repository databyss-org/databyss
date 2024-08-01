/* eslint-disable no-nested-ternary, prefer-template */
const fs = require('fs')
const isWsl = require('is-wsl')
const path = require('path')
const hasha = require('hasha')
const webpack = require('webpack')
// const resolve = require('resolve')
const PnpWebpackPlugin = require('pnp-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const ManifestPlugin = require('webpack-manifest-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
// const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
// const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const paths = require('./paths')
const modules = require('./modules')
const getClientEnvironment = require('./env')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
// const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin')
// const typescriptFormatter = require('react-dev-utils/typescriptFormatter')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const packageJson = require(paths.appPackageJson)
const { InjectManifest } = require('workbox-webpack-plugin')

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false'

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig)

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false
  }

  try {
    require.resolve('react/jsx-runtime')
    return true
  } catch (e) {
    return false
  }
})()

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = (webpackEnv) => {
  console.log('WEBPACK ENV', webpackEnv)
  console.log('APP SOURCE', paths.appSrc)
  console.log('TYPESCRIPT?', useTypeScript)
  const isEnvDevelopment = webpackEnv === 'development'
  const isEnvProduction = webpackEnv === 'production'
  const isEnvTest = process.env.NODE_ENV === 'test'

  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  // In development, we always serve from the root. This makes config easier.
  const publicPath = isEnvProduction
    ? paths.servedPath
    : isEnvDevelopment && '/'
  // Some apps do not use client-side routing with pushState.
  // For these, "homepage" can be set to "." to enable relative asset paths.
  // const shouldUseRelativeAssetPaths = publicPath === './'

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  const publicUrl = isEnvProduction
    ? publicPath.slice(0, -1)
    : isEnvDevelopment && ''
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl)
  console.log('CLIENT ENV', env)

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool:
      isEnvProduction || isEnvTest
        ? shouldUseSourceMap
          ? 'source-map'
          : false
        : isEnvDevelopment && 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: [
      // Include an alternative client for WebpackDevServer. A client's job is to
      // connect to WebpackDevServer by a socket and get notified about changes.
      // When you save a file, the client will either apply hot updates (in case
      // of CSS changes), or refresh the page (in case of JS changes). When you
      // make a syntax error, this client will display a syntax error overlay.
      // Note: instead of the default WebpackDevServer client, we use a custom one
      // to bring better experience for Create React App users. You can replace
      // the line below with these two lines if you prefer the stock client:
      isEnvDevelopment && require.resolve('webpack-dev-server/client') + '?/',
      isEnvDevelopment && require.resolve('webpack/hot/dev-server'),
      // isEnvDevelopment &&
      //   require.resolve('react-dev-utils/webpackHotDevClient'),
      // Finally, this is your app's code:
      paths.appIndexJs,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ].filter(Boolean),
    output: {
      // The build folder.
      path: isEnvProduction ? paths.appBuild : undefined,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/bundle.js',
      // TODO: remove this when upgrading to webpack 5
      // futureEmitAssets: true,
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      // We inferred the "public path" (such as / or /my-project) from homepage.
      // We use "/" in development.
      publicPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate:
        isEnvProduction || isEnvTest
          ? (info) =>
              path
                .relative(paths.appSrc, info.absoluteResourcePath)
                .replace(/\\/g, '/')
          : isEnvDevelopment &&
            ((info) =>
              path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              drop_console: !process.env.SHOW_CONSOLE,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending futher investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
        }),
      ],
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      // splitChunks: {
      //   chunks: 'all',
      //   name: false,
      // },
      // Keep the runtime chunk separated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      // runtimeChunk: true,
    },
    resolve: {
      alias: {
        slate: '@databyss-org/slate',
        '@databyss-org/desktop/src/hooks': path.resolve(
          __dirname,
          '../packages/databyss-notes/hooks/'
        ),
        // react: require.resolve('react'),
        // 'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
        // 'react/jsx-runtime': 'react/jsx-runtime.js',
      },
      fallback: {
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        vm: require.resolve('vm-browserify'),
      },
      // This allows you to set a fallback for where Webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules', paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: paths.moduleFileExtensions
        .map((ext) => `.${ext}`)
        .filter((ext) => useTypeScript || !ext.includes('ts')),
      plugins: [
        // Adds support for installing with Plug'n'Play, leading to faster installs and adding
        // guards against forgotten dependencies and such.
        PnpWebpackPlugin,
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        //
        // new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      ],
    },
    resolveLoader: {
      plugins: [
        // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
        // from the current package.
        PnpWebpackPlugin.moduleLoader(module),
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        // { parser: { requireEnsure: false } },

        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        // {
        //   test: /\.(js|mjs|jsx)$/,
        //   enforce: 'pre',
        //   use: [
        //     {
        //       options: {
        //         formatter: require.resolve('react-dev-utils/eslintFormatter'),
        //         eslintPath: require.resolve('eslint'),
        //       },
        //       loader: require.resolve('eslint-loader'),
        //     },
        //   ],
        //   include: paths.appSrc,
        // },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'public/[name].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                presets: [
                  [
                    require.resolve('babel-preset-react-app'),
                    {
                      runtime: hasJsxRuntime ? 'automatic' : 'classic',
                    },
                  ],
                  '@emotion/babel-preset-css-prop',
                ],
                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent: '@svgr/webpack?-svgo,+ref![path]',
                        },
                      },
                    },
                  ],
                  [require.resolve('babel-plugin-emotion'), {}],
                ],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                cacheCompression: isEnvProduction,
                compact: isEnvProduction,
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              resolve: { fullySpecified: false },
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: isEnvProduction,

                // If an error happens in a package, it's possible to be
                // because it was compiled. Thus, we don't want the browser
                // debugger to show the original code. Instead, the code
                // being evaluated would be much more helpful.
                sourceMaps: false,
              },
            },
            {
              test: /\.(js|mjs)$/,
              resolve: { fullySpecified: false },
              include: /@babel(?:\/|\\{1,2})runtime/,
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    presets: ['react-app', '@emotion/babel-preset-css-prop'],
                  },
                },
                {
                  loader: require.resolve('react-svg-loader'),
                  options: {
                    jsx: true, // true outputs JSX tags
                    svgo: {
                      plugins: [
                        { removeViewBox: false },
                        { mergePaths: false },
                      ],
                    },
                  },
                },
              ],
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|jsx)$/, /\.html$/, /\.json$/, /\.ejs$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          }
          // isEnvProduction
          //   ? {
          //       minify: {
          //         removeComments: true,
          //         collapseWhitespace: true,
          //         removeRedundantAttributes: true,
          //         useShortDoctype: true,
          //         removeEmptyAttributes: true,
          //         removeStyleLinkTypeAttributes: true,
          //         keepClosingSlash: true,
          //         minifyJS: true,
          //         minifyCSS: true,
          //         minifyURLs: true,
          //       },
          //     }
          //   : undefined
        )
      ),
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      isEnvProduction &&
        shouldInlineRuntimeChunk &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      // In production, it will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      // In development, this will be an empty string.
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),
      // This is necessary to emit hot updates (currently CSS only):
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebook/create-react-app/issues/186
      // isEnvDevelopment &&
      //   new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      // Generate an asset-manifest.json file which contains a mapping of all asset filenames
      // to their corresponding output file so that tools can pick it up without
      // having to parse `index.html`.
      // [UNUSED]
      // new ManifestPlugin({
      //   fileName: 'asset-manifest.json',
      //   publicPath,
      //   generate: (seed, files) => {
      //     const manifestFiles = files.reduce((manifest, file) => {
      //       manifest[file.name] = file.path
      //       return manifest
      //     }, seed)

      //     return {
      //       files: {
      //         ...manifestFiles,
      //       },
      //     }
      //   },
      // }),
      // Generate the manifest.json file
      !isEnvTest &&
        !process.env.REACT_APP_STORYBOOK &&
        new CopyWebpackPlugin({
          patterns: [
            {
              from: `${paths.appPublic}/manifest.json`,
              to: paths.appBuild,
              transform: (buf) => {
                const _manifest = JSON.parse(buf.toString())
                _manifest.version = packageJson.version
                return JSON.stringify(_manifest, null, 2)
              },
            },
          ],
        }),
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the Webpack build.
      isEnvProduction &&
        new InjectManifest({
          additionalManifestEntries: [
            {
              url: 'favicon.ico',
              revision: hasha.fromFileSync(
                path.resolve(paths.appPublic, 'favicon.ico'),
                { algorithm: 'md5' }
              ),
            },
            {
              url: 'gsap.min.js',
              revision: '3.6.1',
            },
          ],
          swSrc: path.resolve(__dirname, './service-worker.js'),
          include: [/\.(?:html|png|jpg|jpeg|svg|mp4|js|ico)$/],
          maximumFileSizeToCacheInBytes: 3145728,
        }),
      // TypeScript type checking
      // useTypeScript &&
      //   new ForkTsCheckerWebpackPlugin({
      //     typescript: resolve.sync('typescript', {
      //       basedir: paths.appNodeModules,
      //     }),
      //     async: isEnvDevelopment,
      //     useTypescriptIncrementalApi: true,
      //     checkSyntacticErrors: true,
      //     resolveModuleNameModule: process.versions.pnp
      //       ? `${__dirname}/pnpTs.js`
      //       : undefined,
      //     resolveTypeReferenceDirectiveModule: process.versions.pnp
      //       ? `${__dirname}/pnpTs.js`
      //       : undefined,
      //     tsconfig: paths.appTsConfig,
      //     reportFiles: [
      //       '**',
      //       '!**/__tests__/**',
      //       '!**/?(*.)(spec|test).*',
      //       '!**/src/setupProxy.*',
      //       '!**/src/setupTests.*',
      //     ],
      //     watch: paths.appSrc,
      //     silent: true,
      //     // The formatter is invoked directly in WebpackDevServerUtils during development
      //     formatter: isEnvProduction ? typescriptFormatter : undefined,
      //   }),
    ].filter(Boolean),
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    // node: {
    //   module: 'empty',
    //   dgram: 'empty',
    //   dns: 'mock',
    //   fs: 'empty',
    //   http2: 'empty',
    //   net: 'empty',
    //   tls: 'empty',
    //   child_process: 'empty',
    // },
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
  }
}

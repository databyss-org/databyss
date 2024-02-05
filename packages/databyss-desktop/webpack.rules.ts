import type { ModuleOptions } from 'webpack'

export const rules: Required<ModuleOptions>['rules'] = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    resolve: {
      fullySpecified: false,
    },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.ts$/,
    exclude: /(node_modules|\.webpack)/,
    resolve: {
      fullySpecified: false,
    },
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
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
            plugins: [{ removeViewBox: false }, { mergePaths: false }],
          },
        },
      },
    ],
  },
  {
    test: /\.(jsx?|tsx)$/,
    // include: paths.appSrc,
    exclude: /node_modules/,
    loader: require.resolve('babel-loader'),
    resolve: {
      fullySpecified: false,
    },
    options: {
      customize: require.resolve('babel-preset-react-app/webpack-overrides'),
      presets: ['react-app', '@emotion/babel-preset-css-prop'],
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
      // cacheDirectory: true,
      // cacheCompression: isEnvProduction,
      // compact: isEnvProduction,
    },
  },
  {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
    loader: require.resolve('url-loader'),
    options: {
      limit: 10000,
      name: 'public/[name].[ext]',
    },
  },
]

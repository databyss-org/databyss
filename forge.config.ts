import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import path from 'path'

import { mainConfig } from './packages/databyss-desktop/webpack.main.config'
import { rendererConfig } from './packages/databyss-desktop/webpack.renderer.config'

// load env from .env.production.local
require('dotenv').config({
  path: path.resolve('./.env.production.local'),
})

const appleApiKey = path.resolve('./private_keys/appleApiKey.p8')
const appleApiKeyId = process.env.APPLE_API_KEY_ID!
const appleApiIssuer = process.env.APPLE_API_ISSUER!
console.log('[forge.config] appleApiKey', appleApiKey)
console.log('[forge.config] appleApiKeyId', appleApiKeyId)
console.log('[forge.config] appleApiIssuer', appleApiIssuer)

const config: ForgeConfig = {
  packagerConfig: {
    osxNotarize: {
      appleApiKey,
      appleApiKeyId,
      appleApiIssuer,
    },
    osxSign: {},
    asar: {
      unpack: '*.{node,dll}',
    },
    name: 'Databyss',
    icon: 'public/appIcon',
    protocols: [
      {
        name: 'databyss',
        schemes: ['databyss'],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    // new MakerZIP({}, ['darwin']),
    new MakerDMG({}),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: `default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: dbdrive: data: gap:; connect-src self * 'unsafe-inline' blob: dbdrive: data: gap:; frame-src * self blob: data: gap:; style-src-elem * self 'unsafe-inline'`,
      renderer: {
        // config: rendererConfig('production') as WebpackConfiguration,
        config: rendererConfig,
        entryPoints: [
          {
            html: './packages/databyss-desktop/src/index.html',
            js: './packages/databyss-desktop/src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './packages/databyss-desktop/src/preload.ts',
            },
          },
          {
            html: './packages/databyss-desktop/pdfview/index.html',
            js: './packages/databyss-desktop/pdfview/main.js',
            name: 'pdfview_window',
            preload: {
              js: './packages/databyss-desktop/pdfview/preload.js',
            },
          },
        ],
      },
    }),
  ],
}

export default config

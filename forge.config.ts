import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'

import { mainConfig } from './packages/databyss-desktop/webpack.main.config'
import { rendererConfig } from './packages/databyss-desktop/webpack.renderer.config'
// import rendererConfig from './config/webpack.config'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'Databyss',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: `default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: dbdrive: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:; style-src-elem * self 'unsafe-inline'`,
      renderer: {
        // config: rendererConfig('production') as WebpackConfiguration,
        config: rendererConfig,
        entryPoints: [
          {
            // html: './public/index.html',
            html: './packages/databyss-desktop/src/index.html',
            js: './packages/databyss-desktop/src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './packages/databyss-desktop/src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
}

export default config

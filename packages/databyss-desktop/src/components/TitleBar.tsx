import { View, ViewProps } from '@databyss-org/ui'
import { pxUnits } from '@databyss-org/ui/theming/views'
import React, { ReactNode } from 'react'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('@databyss-org/desktop/src/eapi').default

export interface TitleBarProps extends ViewProps {}

export const TitleBar = ({ children, ...others }: TitleBarProps ) => (
  <View
    position="absolute"
    top={0}
    left={0}
    height={pxUnits(38)}
    bg="gray.0"
    width="100%"
    alignItems="center"
    justifyContent="left"
    flexDirection="row"
    pl={eapi.platform.isWindows ? pxUnits(8) : pxUnits(74)}
    css={{
      '-webkit-user-select': 'none',
      '-webkit-app-region': 'drag',
    }}
    {...others}
  >
    {children}
  </View>
)
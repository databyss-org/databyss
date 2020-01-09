import React, { useLayoutEffect, useState } from 'react'
import addons from '@storybook/addons'
import Content from '@databyss-org/ui/components/Viewport/Content'
import { View } from '@databyss-org/ui/primitives'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import * as auth from '@databyss-org/services/auth/mocks'
import defaultTheme, { darkTheme } from '../theming/theme'
import { ThemeProvider } from '../theming'

const services = { auth }

export const ServiceProviderDecorator = storyFn => (
  <ServiceProvider services={services}>{storyFn()}</ServiceProvider>
)

// get channel to listen to event emitter
const channel = addons.getChannel()
let storybookIsDark = false
channel.on('DARK_MODE', () => {
  storybookIsDark = true
})

export const ViewportWrapper = ({ children, ...others }) => {
  const [isDark, setDark] = useState(storybookIsDark)

  useLayoutEffect(() => {
    // listen to DARK_MODE event
    channel.on('DARK_MODE', setDark)
    return () => channel.removeListener('DARK_MODE', setDark)
  }, [])

  return (
    <ThemeProvider theme={isDark ? darkTheme : defaultTheme}>
      <View
        paddingVariant="medium"
        backgroundColor="pageBackground"
        minHeight="100vh"
        {...others}
      >
        {children}
      </View>
    </ThemeProvider>
  )
}

export const ViewportDecorator = storyFn => (
  <ViewportWrapper>{storyFn()}</ViewportWrapper>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>

export const NotifyDecorator = storyFn => (
  <NotifyProvider envPrefix="STORYBOOK">{storyFn()}</NotifyProvider>
)

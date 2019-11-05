import React, { useLayoutEffect, useState } from 'react'
import addons from '@storybook/addons'
import Content from '@databyss-org/ui/components/Viewport/Content'
import Viewport from '@databyss-org/ui/components/Viewport/ThemedViewport'
import ServiceProvider from '@databyss-org/services/components/ServiceProvider'
import * as auth from '@databyss-org/services/auth/mocks'
import defaultTheme, { darkTheme } from '../theming/theme'

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
    <Viewport
      theme={isDark ? darkTheme : defaultTheme}
      paddingVariant="medium"
      backgroundColor="pageBackground"
      minHeight="100vh"
      {...others}
    >
      {children}
    </Viewport>
  )
}

export const ViewportDecorator = storyFn => (
  <ViewportWrapper>{storyFn()}</ViewportWrapper>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>

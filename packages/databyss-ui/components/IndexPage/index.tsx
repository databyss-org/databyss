import React from 'react'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'
import { pxUnits } from '../../theming/views'

export const IndexResultsContainer = ({ children }) => (
  <View mb="medium" widthVariant="content">
    {children}
  </View>
)

export const IndexResultTitle = ({ href, text, icon, dataTestElement }) => (
  <BaseControl
    data-test-element={dataTestElement}
    href={href}
    py="tiny"
    mb="tiny"
    childViewProps={{ justifyContent: 'center' }}
  >
    <Icon
      sizeVariant="tiny"
      color="gray.5"
      position="absolute"
      left="mediumNegative"
    >
      {icon}
    </Icon>
    <Text color="text.3" variant="uiTextNormalSemibold">
      {text}
    </Text>
  </BaseControl>
)

export const IndexResultDetails = ({ dataTestElement, text, ...others }) => (
  <BaseControl
    data-test-element={dataTestElement}
    hoverColor="background.2"
    activeColor="background.3"
    py="tiny"
    mt="tiny"
    {...others}
  >
    <Text>{text}</Text>
  </BaseControl>
)

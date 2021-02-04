import React from 'react'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'

export const IndexResultsContainer = ({ children }) => (
  <View mb="medium" widthVariant="content">
    {children}
  </View>
)

export const IndexResultTitle = ({ href, text, icon, dataTestElement }) => (
  <View height="40px">
    <BaseControl
      data-test-element={dataTestElement}
      hoverColor="background.2"
      activeColor="background.3"
      href={href}
    >
      <Grid singleRow alignItems="center" columnGap="small">
        <Icon sizeVariant="small" color="text.3">
          {icon}
        </Icon>
        <Text variant="bodyHeading3">{text}</Text>
      </Grid>
    </BaseControl>
  </View>
)

export const IndexResultDetails = ({ dataTestElement, text, ...others }) => (
  <BaseControl
    data-test-element={dataTestElement}
    hoverColor="background.2"
    activeColor="background.3"
    p="tiny"
    mt="tiny"
    {...others}
  >
    <View p="tiny">
      <Text>{text}</Text>
    </View>
  </BaseControl>
)

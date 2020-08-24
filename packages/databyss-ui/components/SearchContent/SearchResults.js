import React from 'react'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'
import { widthVariants } from '@databyss-org/ui/theming/views'

export const SearchResultsContainer = ({ children }) => (
  <View mb="medium" maxWidth={widthVariants.content.maxWidth}>
    {children}
  </View>
)

export const SearchResultTitle = ({ onPress, text, icon, dataTestElement }) => (
  <View height="40px">
    <BaseControl
      data-test-element={dataTestElement}
      hoverColor="background.2"
      activeColor="background.3"
      onPress={onPress}
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

export const SearchResultDetails = ({ onPress, dataTestElement, text }) => (
  <BaseControl
    data-test-element={dataTestElement}
    hoverColor="background.2"
    activeColor="background.3"
    onPress={onPress}
  >
    <View p="tiny">
      <Text>{text}</Text>
    </View>
  </BaseControl>
)

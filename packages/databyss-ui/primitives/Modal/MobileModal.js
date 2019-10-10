import React from 'react'
import { View, Text, Grid, Button } from '../'

// renders the window controls (title, cancel, ok, etc) for a mobile modal
const MobileModal = ({ title, dismissChild, secondaryChild, children }) => (
  <View bg="background.0" height="100%">
    <View
      mb="small"
      borderBottomWidth={1}
      borderBottomColor="border.1"
      paddingBottom="tiny"
      paddingTop="small"
    >
      <Grid singleRow columnGap="none" alignItems="center">
        <View flexBasis="25%">{secondaryChild}</View>
        <View flexBasis="50%" alignItems="center">
          <Text>{title}</Text>
        </View>
        <View flexBasis="25%" paddingRight="small" alignItems="flex-end">
          <Button variant="uiLink">{dismissChild}</Button>
        </View>
      </Grid>
    </View>
    <View flexGrow={1}>{children}</View>
  </View>
)

MobileModal.defaultProps = {
  dismissChild: 'Done',
  secondaryChild: null,
}

export default MobileModal

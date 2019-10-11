import React from 'react'
import { View, Text, Grid, Button } from '../'

// renders the window controls (title, cancel, ok, etc) for a mobile modal
const MobileModal = ({
  title,
  dismissChild,
  secondaryChild,
  onDismiss,
  children,
  ...others
}) => (
  <View bg="background.0" height="100%">
    <View
      borderBottomWidth={1}
      borderBottomColor="border.1"
      paddingBottom="tiny"
      paddingTop="small"
    >
      <Grid singleRow columnGap="none" alignItems="center">
        <View flexBasis="25%" paddingLeft="small" alignItems="flex-start">
          {secondaryChild ? (
            <Button variant="uiLink">{secondaryChild}</Button>
          ) : null}
        </View>
        <View flexBasis="50%" alignItems="center">
          <Text variant="uiTextNormal">{title}</Text>
        </View>
        <View flexBasis="25%" paddingRight="small" alignItems="flex-end">
          <Button variant="uiLink" onPress={onDismiss}>
            {dismissChild}
          </Button>
        </View>
      </Grid>
    </View>
    <View flexGrow={1} {...others}>
      {children}
    </View>
  </View>
)

MobileModal.defaultProps = {
  dismissChild: 'Done',
  secondaryChild: null,
}

export default MobileModal

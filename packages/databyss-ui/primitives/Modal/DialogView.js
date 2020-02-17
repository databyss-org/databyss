import React from 'react'
import { View, Text, Grid, Button } from '../'

const DialogView = ({
  message,
  confirmButton,
  onDismiss,
  onConfirm,
  ...others
}) => (
  <View paddingVariant="medium" flexShrink={1} {...others}>
    <Text variant="uiTextNormal">{message}</Text>
    <Grid singleColumn rowGap="tiny" mt="em">
      {React.cloneElement(confirmButton, {
        flexGrow: 1,
        onPress: () => {
          onConfirm()
          onDismiss()
        },
      })}
    </Grid>
  </View>
)

DialogView.defaultProps = {
  onConfirm: () => null,
  onDismiss: () => null,
  confirmButton: <Button variant="secondaryUi">Ok</Button>,
}

export default DialogView

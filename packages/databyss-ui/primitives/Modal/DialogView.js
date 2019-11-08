import React from 'react'
import { View, Text, Grid } from '../'

const DialogView = ({
  message,
  confirmButton,
  cancelButton,
  onDismiss,
  onConfirm,
  onCancel,
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
  onCancel: () => null,
  onDismiss: () => null,
}

export default DialogView

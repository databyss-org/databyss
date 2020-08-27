import React from 'react'
import nl2br from 'react-nl2br'
import { View, Text, Grid, Button } from '../'

const DialogView = ({
  message,
  confirmButton,
  onDismiss,
  onConfirm,
  showConfirmButton,
  ...others
}) => (
  <View paddingVariant="medium" flexShrink={1} {...others}>
    <Text variant="uiTextNormal">{nl2br(message)}</Text>
    {showConfirmButton && (
      <Grid singleColumn rowGap="tiny" mt="em">
        {React.cloneElement(confirmButton, {
          flexGrow: 1,
          onPress: () => {
            onConfirm()
            onDismiss()
          },
        })}
      </Grid>
    )}
  </View>
)

DialogView.defaultProps = {
  showConfirmButton: true,
  onConfirm: () => null,
  onDismiss: () => null,
  confirmButton: <Button variant="secondaryUi">Ok</Button>,
}

export default DialogView

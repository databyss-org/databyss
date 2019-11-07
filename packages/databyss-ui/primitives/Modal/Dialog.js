import React from 'react'
import Modal from './Modal'
import { View, Text, Grid } from '../'

const Dialog = ({
  message,
  confirmButton,
  cancelButton,
  onDismiss,
  onConfirm,
  onCancel,
  ...others
}) => (
  <Modal {...others}>
    <View paddingVariant="medium">
      <Text variant="uiTextNormal">{message}</Text>
      <Grid singleColumn rowGap="tiny" mt="2">
        {React.cloneElement(confirmButton, {
          onClick: () => {
            onConfirm()
            onDismiss()
          },
        })}
      </Grid>
    </View>
  </Modal>
)

Dialog.defaultProps = {
  onConfirm: () => null,
  onCancel: () => null,
  onDismiss: () => null,
}

export default Dialog

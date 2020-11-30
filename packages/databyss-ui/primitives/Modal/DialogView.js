import React from 'react'
import nl2br from 'react-nl2br'
import { View, Text, List, Button, RawHtml } from '../'

const DialogView = ({
  message,
  confirmButtons,
  onConfirm,
  showConfirmButtons,
  html,
  ...others
}) => {
  if (!confirmButtons.length) {
    confirmButtons.push(
      <Button variant="secondaryUi" onPress={onConfirm}>
        Ok
      </Button>
    )
  }
  return (
    <View paddingVariant="medium" flexShrink={1} {...others}>
      {html ? (
        <RawHtml html={message} variant="uiTextNormal" />
      ) : (
        <Text variant="uiTextNormal">{nl2br(message)}</Text>
      )}
      {showConfirmButtons && (
        <List verticalItemPadding="small">
          {confirmButtons.map((btn, key) => (
            <View key={key}>{btn}</View>
          ))}
        </List>
      )}
    </View>
  )
}

DialogView.defaultProps = {
  showConfirmButtons: true,
  onConfirm: () => null,
  confirmButtons: [],
}

export default DialogView

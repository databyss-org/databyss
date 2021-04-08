import React, { useState, useEffect, useRef } from 'react'
import nl2br from 'react-nl2br'
import { View, Text, List, Button, RawHtml } from '../'

const DialogView = ({
  message,
  confirmButtons,
  onConfirm,
  showConfirmButtons,
  html,
  dolphins,
  ...others
}) => {
  const [, setDolphinString] = useState('')
  const timerRef = useRef(null)
  const dolphinsRef = useRef('🐬')
  useEffect(() => {
    if (dolphins) {
      timerRef.current = setInterval(() => {
        dolphinsRef.current += '🐬'
        setDolphinString(dolphinsRef.current)
      }, 10000)
      return () => {
        clearInterval(timerRef.current)
      }
    }
    return () => null
  }, [])
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
      {dolphins && (
        <Text variant="uiTextNormal" flexWrap="wrap" color="gray.5" width={215}>
          {dolphinsRef.current}[{dolphinsRef.current.length / 2}]
        </Text>
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

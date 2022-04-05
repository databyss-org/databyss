import React, { ReactNode, useState } from 'react'
import { darkTheme, pxUnits } from '@databyss-org/ui/theming/theme'
import {
  View,
  Grid,
  RawHtml,
  Icon,
  BaseControl,
} from '@databyss-org/ui/primitives'
import CloseSvg from '@databyss-org/ui/assets/close.svg'

interface StickyMessageProps {
  messageId?: string | null
  html?: string | null
  children?: ReactNode | null
  rightAlignChildren?: ReactNode | null
  visible?: boolean
  canDismiss?: boolean
}

const StickyMessage = ({
  messageId,
  html,
  children,
  visible,
  canDismiss,
  rightAlignChildren,
}: StickyMessageProps) => {
  const [dismissed, setDismissed] = useState(
    messageId ? localStorage.getItem(`${messageId}_dismissed`) : false
  )
  const dismiss = () => {
    if (messageId) {
      localStorage.setItem(`${messageId}_dismissed`, '1')
    }
    setDismissed('1')
  }
  if (dismissed || !visible) {
    return null
  }
  return (
    <View
      bg="background.0"
      width="100%"
      alignItems="left"
      py="em"
      pl="em"
      pr="medium"
      theme={darkTheme}
      flexShrink={0}
      flexGrow={0}
      overflow="hidden"
      borderBottomWidth={pxUnits(1)}
      borderBottomColor="gray.3"
      borderBottomStyle="solid"
    >
      <Grid singleRow columnGap="large" flexWrap="nowrap">
        <View flexGrow={1} flexShrink={1} overflow="hidden">
          {html ? (
            <RawHtml html={html} color="text.0" variant="uiTextNormal" />
          ) : (
            children
          )}
        </View>
        {rightAlignChildren && (
          <View alignSelf="flex-start">{rightAlignChildren}</View>
        )}

        {canDismiss && (
          <BaseControl
            onPress={dismiss}
            py="tiny"
            px="tiny"
            alignSelf="flex-start"
          >
            <Icon sizeVariant="tiny" color="text.3">
              <CloseSvg />
            </Icon>
          </BaseControl>
        )}
      </Grid>
    </View>
  )
}

StickyMessage.defaultProps = {
  visible: true,
  canDismiss: true,
}

export default StickyMessage

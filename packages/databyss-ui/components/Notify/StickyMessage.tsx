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
      position="absolute"
      bottom="tiny"
      right="small"
      width={pxUnits(360)}
      bg="background.0"
      alignItems="left"
      py="em"
      pl="em"
      pr="medium"
      theme={darkTheme}
      flexShrink={0}
      flexGrow={0}
      overflow="hidden"
      borderWidth={pxUnits(1)}
      borderColor="gray.3"
      borderStyle="solid"
      zIndex="sticky"
    >
      <Grid singleRow columnGap="large" flexWrap="nowrap" alignItems="center">
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
            pb="tiny"
            pt={pxUnits(1)}
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

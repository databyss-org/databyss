import React, { useState } from 'react'
import { ThemeProvider } from 'emotion-theming'
import { darkTheme } from '@databyss-org/ui/theming/theme'
import {
  View,
  Grid,
  RawHtml,
  Icon,
  BaseControl,
} from '@databyss-org/ui/primitives'
import CloseSvg from '@databyss-org/ui/assets/close.svg'

const StickyMessage = ({ messageId, html, children, visible }) => {
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
    <ThemeProvider theme={darkTheme}>
      <View bg="background.0" width="100%" alignItems="center" py="em">
        <Grid
          widthVariant="content"
          singleRow
          columnGap="small"
          flexWrap="nowrap"
        >
          <View width="100%" pr="medium">
            {html ? (
              <RawHtml html={html} color="text.0" variant="uiTextNormal" />
            ) : (
              children
            )}
          </View>
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
        </Grid>
      </View>
    </ThemeProvider>
  )
}

StickyMessage.defaultProps = {
  visible: true,
}

export default StickyMessage

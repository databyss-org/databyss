import React from 'react'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { View, Text, Grid, Button, ScrollView, Icon } from '../'
import { isMobileOs } from '../../lib/mediaQuery'

// renders the window controls (title, cancel, ok, etc) for a modal
const ModalView = ({
  title,
  dismissChild,
  secondaryChild,
  onDismiss,
  children,
  ...others
}) => (
  <View
    bg="background.0"
    {...(isMobileOs() ? { height: '100%' } : { flexShrink: 1, flexGrow: 1 })}
  >
    <View
      borderBottomWidth={1}
      borderBottomColor="border.1"
      paddingBottom="small"
      paddingTop="small"
    >
      <Grid singleRow columnGap="none" alignItems="center">
        {secondaryChild ? (
          <View flexBasis="25%" paddingLeft="small" alignItems="flex-start">
            <Button variant="uiLink">{secondaryChild}</Button>
          </View>
        ) : null}
        <View
          flexGrow={1}
          alignItems={secondaryChild ? 'center' : 'flex-start'}
          paddingLeft={secondaryChild ? 'none' : '2'}
        >
          <Text variant="uiTextNormal">{title}</Text>
        </View>
        <View flexBasis="25%" paddingRight="small" alignItems="flex-end">
          <Button variant="uiLink" onPress={onDismiss}>
            {dismissChild}
          </Button>
        </View>
      </Grid>
    </View>
    <ScrollView
      flexGrow={1}
      flexShrink={1}
      padding="2"
      {...(isMobileOs() ? { flexBasis: 0, paddingBottom: 'medium' } : {})}
      {...others}
    >
      {children}
    </ScrollView>
  </View>
)

ModalView.defaultProps = {
  dismissChild: isMobileOs() ? (
    'Done'
  ) : (
    <Icon sizeVariant="tiny">
      <CloseSvg />
    </Icon>
  ),
  secondaryChild: null,
}

export default ModalView

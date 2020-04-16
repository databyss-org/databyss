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
      borderBottomColor="border.2"
      paddingBottom="small"
      paddingTop="small"
    >
      <Grid singleRow columnGap="none" alignItems="center">
        {secondaryChild ? (
          <View flexBasis="25%" paddingLeft="small" alignItems="flex-start">
            <Button variant="uiTextButton">{secondaryChild}</Button>
          </View>
        ) : null}
        <View
          flexGrow={1}
          alignItems={secondaryChild ? 'center' : 'flex-start'}
          paddingLeft={secondaryChild ? 'none' : 'em'}
        >
          <Text variant="uiTextNormal">{title}</Text>
        </View>
        <View flexBasis="25%" paddingRight="small" alignItems="flex-end">
          <Button
            data-test-dismiss-modal
            variant="uiTextButton"
            onPress={onDismiss}
          >
            {dismissChild}
          </Button>
        </View>
      </Grid>
    </View>
    <ScrollView
      flexGrow={1}
      flexShrink={1}
      padding="em"
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

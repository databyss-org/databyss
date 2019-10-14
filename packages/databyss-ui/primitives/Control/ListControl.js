import React from 'react'
import { ScrollView, View } from '../'
import BaseControl from './BaseControl'
import { pxUnits } from '../../theming/views'

const ListControl = ({
  data,
  renderItem,
  keySelector,
  onItemPress,
  itemSeparatorColor,
  itemSeparatorWidth,
  itemSpacing,
  ...others
}) => (
  <ScrollView {...others}>
    {data.map((item, index) => {
      const borderProps =
        itemSeparatorWidth && index > 0
          ? {
              borderStyle: 'solid',
              borderTopColor: itemSeparatorColor,
              borderTopWidth: pxUnits(itemSeparatorWidth),
            }
          : {}
      return (
        <View {...borderProps}>
          <BaseControl
            key={keySelector({ item, index })}
            onPress={onItemPress && (() => onItemPress({ item, index }))}
            borderRadius={0}
            childViewProps={{
              paddingTop: pxUnits(itemSpacing),
              paddingBottom: pxUnits(itemSpacing),
            }}
          >
            {renderItem({ item, index })}
          </BaseControl>
        </View>
      )
    })}
  </ScrollView>
)

ListControl.defaultProps = {
  keySelector: ({ index }) => index,
  itemSeparatorColor: 'border.1',
  itemSpacing: 0,
}

export default ListControl

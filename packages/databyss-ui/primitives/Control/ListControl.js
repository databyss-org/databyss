import React from 'react'
import { ScrollView } from '../'
import BaseControl from './BaseControl'

const ListControl = ({
  data,
  renderItem,
  keySelector,
  onItemPress,
  ...others
}) => (
  <ScrollView {...others}>
    {data.map((item, index) => (
      <BaseControl
        key={keySelector({ item, index })}
        onPress={onItemPress && (() => onItemPress({ item, index }))}
        borderRadius={0}
        containerProps={{ borderRadius: 0 }}
      >
        {renderItem({ item, index })}
      </BaseControl>
    ))}
  </ScrollView>
)

ListControl.defaultProps = {
  keySelector: ({ index }) => index,
}

export default ListControl

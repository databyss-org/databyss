import React from 'react'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import { View } from '@databyss-org/ui/primitives'

const Loading = ({ size, ...others }) => (
  <View justifyContent="center" alignItems="center" {...others}>
    <LoadingIcon width={size} height={size} />
  </View>
)

Loading.defaultProps = {
  size: 25,
}

export default Loading

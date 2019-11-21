import React from 'react'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import { View } from '@databyss-org/ui/primitives'

const Loading = props => (
  <View justifyContent="center" alignItems="center" {...props}>
    <LoadingIcon width="25" height="25" />
  </View>
)

export default Loading

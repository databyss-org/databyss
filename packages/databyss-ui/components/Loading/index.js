import React from 'react'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import { View } from '@databyss-org/ui/primitives'

const Loading = () => (
  <View height="100%" justifyContent="center">
    <View alignSelf="center" height={100}>
      <LoadingIcon />
    </View>
  </View>
)

export default Loading

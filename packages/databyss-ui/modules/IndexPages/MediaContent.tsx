import React from 'react'
import { Text } from '../..'
import { IndexPageView } from './IndexPageContent'

export const MediaContent = () => {
  console.log('[MediaContent]')
  return (
    <IndexPageView
      path={['Media']}
      key="media"
      position="relative"
      menuChild={null}
    >
      <Text>Media</Text>
    </IndexPageView>
  )
}

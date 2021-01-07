import React, { useCallback, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import { throttle } from 'lodash'
import styled from '../styled'
import View, { styleProps } from './View'
import IS_NATIVE from '../../lib/isNative'

const Styled = IS_NATIVE ? styled(ScrollView, styleProps) : View

export default ({ children, shadowOnScroll, ...others }) => {
  const viewRef = useRef()
  const [scrollTop, setScrollTop] = useState(0)
  const webProps = {
    overflowY: 'auto',
    overflowX: 'hidden',
    css: {
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
    },
  }
  const nativeProps = {}
  const onScroll = useCallback(
    throttle(() => {
      if (!viewRef.current) {
        return
      }
      setScrollTop(viewRef.current.scrollTop)
    }, 100),
    [viewRef]
  )
  return (
    <Styled
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...others}
      ref={viewRef}
      {...(shadowOnScroll
        ? {
            onScroll,
            borderTopWidth: '1px',
            css: {
              transition: 'border-top-color 100ms linear',
            },
            ...(scrollTop > 0
              ? {
                  borderTopColor: 'border.1',
                }
              : {
                  borderTopColor: 'transparent',
                }),
          }
        : {})}
    >
      {children}
      {IS_NATIVE && <View height={50} />}
    </Styled>
  )
}

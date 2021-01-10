import React, { useCallback, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import { throttle } from 'lodash'
import css from '@styled-system/css'
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
  const shadowOnScrollProps = shadowOnScroll
    ? {
        onScroll,
        borderTopWidth: '1px',
        css: css({
          '&:before': {
            content: '""',
            display: 'block',
            width: '100%',
            height: '100%',
            position: 'fixed',
            padding: '5px',
            transition: 'box-shadow 30ms linear',
            pointerEvents: 'none',
            zIndex: 1,
            boxShadow:
              scrollTop > 0
                ? `inset -5px 0 5px ${
                    typeof shadowOnScroll === 'string'
                      ? shadowOnScroll
                      : 'black'
                  }`
                : 'none',
          },
        }),
      }
    : {}
  return (
    <Styled
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...(IS_NATIVE ? {} : shadowOnScrollProps)}
      {...others}
      ref={viewRef}
    >
      {children}
      {IS_NATIVE && <View height={50} />}
    </Styled>
  )
}

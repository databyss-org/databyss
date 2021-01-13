import React, { useCallback, useRef, useState, forwardRef } from 'react'
import { ScrollView as NativeScrollView } from 'react-native'
import { throttle } from 'lodash'
import css from '@styled-system/css'
import forkRef from '@databyss-org/ui/lib/forkRef'
import { get } from '@styled-system/core'
import { withTheme } from 'emotion-theming'
import styled from '../styled'
import View, { styleProps } from './View'
import IS_NATIVE from '../../lib/isNative'

const Styled = IS_NATIVE ? styled(NativeScrollView, styleProps) : View

const ScrollView = forwardRef(
  ({ children, shadowOnScroll, theme, ...others }, ref) => {
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
              zIndex: get(theme.zIndex, 'scrollEffects'),
              boxShadow:
                scrollTop > 0
                  ? `inset -5px 0 5px ${
                      typeof shadowOnScroll === 'string'
                        ? shadowOnScroll
                        : get(theme.colors, 'scrollShadow')
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
        ref={forkRef(ref, viewRef)}
      >
        {children}
        {IS_NATIVE && <View height={50} />}
      </Styled>
    )
  }
)

export default withTheme(ScrollView)

import React, { useCallback, useRef, useState, forwardRef } from 'react'
import { throttle } from 'lodash'
import css from '@styled-system/css'
import forkRef from '@databyss-org/ui/lib/forkRef'
import { get } from '@styled-system/core'
import { withTheme } from 'emotion-theming'
import View from './View'
import IS_NATIVE from '../../lib/isNative'

const Styled = View

const ScrollView = forwardRef(
  ({ children, shadowOnScroll, theme, scrollbarColor, ...others }, ref) => {
    const viewRef = useRef()
    const [scrollTop, setScrollTop] = useState(0)
    const webProps = {
      overflowY: 'auto',
      overflowX: 'hidden',
      css: {
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        '::-webkit-scrollbar-thumb': {
          background: scrollbarColor,
        },
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
          css: css({
            '&:before': {
              content: '""',
              display: 'block',
              width: '100%',
              height: '100%',
              position: 'fixed',
              padding: '5px',
              transition: 'box-shadow 240ms ease-out',
              pointerEvents: 'none',
              zIndex: get(theme.zIndex, 'scrollEffects'),
              boxShadow:
                scrollTop > 0
                  ? `inset -4px 0 3px ${
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

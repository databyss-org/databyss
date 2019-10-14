import React, { useRef } from 'react'
import css from '@styled-system/css'
import { ThemeContext } from '@emotion/core'
import ClickAwayListener from '../../Util/ClickAwayListener'
import { isMobileOs } from '../../../lib/mediaQuery'
import { View, Text } from '../../'
import effects from '../../../theming/effects'

const desktopInputCss = {
  display: 'flex',
  position: 'relative',
  zIndex: 1,
  pointerEvents: 'none',
  padding: '1px',
  paddingLeft: '2px',
  backgroundColor: 'transparent',
}

const mobileInputCss = active => ({
  position: active ? 'relative' : 'absolute',
  padding: active ? 'small' : 'none',
  opacity: 0,
})

const mobileViewCss = active =>
  active
    ? {
        position: 'absolute',
        zIndex: 5,
        top: '-5px',
        left: '25%',
        right: '5px',
        padding: 'none',
        bg: 'transparent',
        marginRight: 0,
        ...effects.modalShadow,
      }
    : {}

const activeInputCss = {
  bg: 'background.0',
  pointerEvents: 'all',
  cursor: 'text',
  opacity: 1,
  borderRadius: 0,
  margin: 0,
}

const TextInputView = ({ active, children, value, label, ...others }) => {
  const child = React.Children.only(children)
  const viewRef = useRef(null)
  const inputRef = useRef(null)
  const setRef = _ref => {
    inputRef.current = _ref
    if (child.ref) {
      child.ref.current = _ref
    }
  }

  return (
    <ThemeContext.Consumer>
      {theme => (
        <View overflow="visible" ref={viewRef} {...others} flexShrink={1}>
          {isMobileOs() && (
            <View padding="1px" flexShrink={1} flexWrap="wrap">
              <Text variant={child.props.variant}>
                {child.props.value.textValue}
              </Text>
            </View>
          )}

          <ClickAwayListener
            onClickAway={() => {
              if (isMobileOs() && active) {
                child.props.onBlur()
              }
            }}
          >
            <View
              css={[isMobileOs() && css(mobileViewCss(active))(theme)]}
              onClick={
                isMobileOs()
                  ? () => {
                      if (inputRef.current) {
                        inputRef.current.focus()
                      }
                    }
                  : null
              }
            >
              {React.cloneElement(child, {
                variant: isMobileOs() ? 'uiTextNormal' : child.props.variant,
                css: [
                  { outlineOffset: 0, outline: 'none', borderWidth: 0 },
                  isMobileOs() && css(mobileInputCss(active))(theme),
                  !isMobileOs() && css(desktopInputCss)(theme),
                  active && css(activeInputCss)(theme),
                ],
                onBlur: isMobileOs() ? () => null : child.props.onBlur,
                ref: setRef,
              })}
            </View>
          </ClickAwayListener>
        </View>
      )}
    </ThemeContext.Consumer>
  )
}

export default TextInputView

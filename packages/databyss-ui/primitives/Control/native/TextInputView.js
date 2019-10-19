import React, { useRef } from 'react'
import css from '@styled-system/css'
import { ThemeContext } from '@emotion/core'
import ClickAwayListener from '../../Util/ClickAwayListener'
import forkRef from '../../Util/forkRef'
import { isMobileOs } from '../../../lib/mediaQuery'
import { View, Text } from '../../'

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

const _isMobileOs = isMobileOs()

const TextInputView = ({ active, children, value, label, ...others }) => {
  const child = React.Children.only(children)
  const viewRef = useRef(null)
  const inputRef = useRef(null)

  return (
    <ThemeContext.Consumer>
      {theme => (
        <View ref={viewRef} {...others} flexShrink={1}>
          {_isMobileOs && (
            <View padding="1px" flexShrink={1} flexWrap="wrap">
              <Text variant={child.props.variant}>
                {child.props.value.textValue}
              </Text>
            </View>
          )}

          <ClickAwayListener
            onClickAway={() => {
              if (_isMobileOs && active) {
                child.props.onBlur()
              }
            }}
          >
            <View
              css={[_isMobileOs && css(mobileViewCss(active))(theme)]}
              shadowVariant={_isMobileOs ? 'modal' : 'none'}
              onClick={
                _isMobileOs
                  ? () => {
                      if (inputRef.current) {
                        inputRef.current.focus()
                      }
                    }
                  : null
              }
            >
              {React.cloneElement(child, {
                variant: _isMobileOs ? 'uiTextNormal' : child.props.variant,
                css: [
                  { outlineOffset: 0, outline: 'none', borderWidth: 0 },
                  _isMobileOs && css(mobileInputCss(active))(theme),
                  !_isMobileOs && css(desktopInputCss)(theme),
                  active && css(activeInputCss)(theme),
                ],
                onBlur: _isMobileOs ? () => null : child.props.onBlur,
                ref: forkRef(child.ref, inputRef),
              })}
            </View>
          </ClickAwayListener>
        </View>
      )}
    </ThemeContext.Consumer>
  )
}

export default TextInputView

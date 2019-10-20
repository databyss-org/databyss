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
  padding: '1px',
  paddingLeft: '2px',
  backgroundColor: 'transparent',
}

const mobileInputCss = active => ({
  position: active ? 'relative' : 'absolute',
  padding: active ? 'small' : 'none',
  opacity: 0,
})

const mobileViewCss = (active, label) =>
  active
    ? {
        position: 'absolute',
        zIndex: 2,
        top: '-5px',
        left: label ? '25%' : '-5px',
        right: label ? '5px' : '-5px',
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

const TextInputView = ({
  active,
  children,
  value,
  label,
  modal,
  smallText,
  controlRef,
  ...others
}) => {
  const child = React.Children.only(children)
  const viewRef = useRef(null)
  const inputRef = useRef(null)

  const _modal = modal || (isMobileOs() && smallText)

  return (
    <ThemeContext.Consumer>
      {theme => (
        <View ref={viewRef} {...others} flexShrink={1}>
          {_modal && (
            <View padding="1px" flexShrink={1} flexWrap="wrap">
              <Text variant={child.props.variant}>
                {child.props.value.textValue}
              </Text>
            </View>
          )}

          <ClickAwayListener
            additionalNodeRefs={controlRef ? [controlRef] : undefined}
            onClickAway={() => {
              if (_modal && active && child.props.onBlur) {
                child.props.onBlur()
              }
            }}
          >
            <View
              css={[_modal && css(mobileViewCss(active, label))(theme)]}
              shadowVariant={_modal ? 'modal' : 'none'}
              onClick={
                _modal
                  ? () => {
                      if (inputRef.current) {
                        inputRef.current.focus()
                      }
                    }
                  : null
              }
            >
              {React.cloneElement(child, {
                variant: _modal ? 'uiTextNormal' : child.props.variant,
                css: [
                  {
                    outlineOffset: 0,
                    outline: 'none',
                    borderWidth: 0,
                    pointerEvents: 'none',
                  },
                  _modal && css(mobileInputCss(active))(theme),
                  !_modal && css(desktopInputCss)(theme),
                  active && css(activeInputCss)(theme),
                ],
                onBlur: child.props.onBlur,
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

import React, { useRef } from 'react'
import css from '@styled-system/css'
import { ThemeContext } from '@emotion/core'
import forkRef from '@databyss-org/ui/lib/forkRef'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { isMobileOs } from '../../../lib/mediaQuery'
import { View, Text, RawHtml } from '../../'
import { borderRadius } from '../../../theming/theme'

const desktopInputCss = {
  display: 'flex',
  position: 'relative',
  zIndex: 1,
  padding: '2px',
  paddingLeft: 'tiny',
  paddingRight: 'tiny',
  backgroundColor: 'transparent',
}

const mobileInputCss = active => ({
  position: active ? 'relative' : 'absolute',
  padding: active ? 'small' : 'none',
  opacity: 0,
})

const modalViewCss = (active, labelWidth) =>
  active
    ? {
        position: 'absolute',
        zIndex: 2,
        left: labelWidth ? `calc(${labelWidth} - 8px)` : '-5px',
        right: labelWidth ? '5px' : '-5px',
        padding: 'none',
        bg: 'transparent',
        marginRight: 0,
        borderRadius,
      }
    : {
        position: 'absolute',
      }

const activeInputCss = modal => ({
  bg: 'activeTextInputBackground',
  pointerEvents: 'all',
  cursor: 'text',
  opacity: 1,
  borderRadius,
  paddingLeft: modal ? 'small' : 'tiny',
  paddingRight: modal ? 'small' : 'tiny',
  margin: 0,
})

const TextInputView = ({
  active,
  children,
  labelOffset,
  modal,
  smallText,
  controlRef,
  ...others
}) => {
  const child = React.Children.only(children)
  const viewRef = useRef(null)
  const inputRef = useRef(null)

  const _modal = modal || (isMobileOs() && smallText)
  const _labelWidth =
    labelOffset.toString().indexOf('%') >= 0 ? labelOffset : `${labelOffset}px`

  const { textValue } = child.props.value

  return (
    <ThemeContext.Consumer>
      {theme => (
        <View ref={viewRef} {...others} flexShrink={1}>
          {_modal && (
            <View padding="1px" flexShrink={1} flexWrap="wrap">
              {textValue && textValue.length ? (
                <Text variant={child.props.variant}>{textValue}</Text>
              ) : (
                <RawHtml variant={child.props.variant} html="&nbsp;" />
              )}
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
              css={[_modal && css(modalViewCss(active, _labelWidth))(theme)]}
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
                variant: _modal ? 'bodyNormal' : child.props.variant,
                concatCss: [
                  {
                    outlineOffset: 0,
                    outline: 'none',
                    borderWidth: 0,
                    pointerEvents: 'none',
                  },
                  _modal && css(mobileInputCss(active))(theme),
                  !_modal && css(desktopInputCss)(theme),
                  active && css(activeInputCss(_modal))(theme),
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

TextInputView.defaultProps = {
  labelOffset: 0,
}

export default TextInputView

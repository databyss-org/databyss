import React, { useState, useRef, useEffect } from 'react'

import { colors } from '../../theming'
import { isMobileOs } from '../../lib/mediaQuery'
import { View, Text, Grid } from '../'
import IS_NATIVE from '../../lib/isNative'
import theme from '../../theming/theme'

import BaseControl from './BaseControl'
import RichTextInput from './native/RichTextInput'
import TextInput from './native/TextInput'
import TextInputView from './native/TextInputView'

const TextControl = ({
  value,
  onChange,
  label,
  labelProps,
  labelColor,
  activeLabelColor,
  labelVariant,
  inputVariant,
  id,
  gridFlexWrap,
  rich,
  modal,
  multiline,
  focusOnMount,
  css,
  dataTestId,
  placeholder,
  inputProps,
  ...others
}) => {
  const [active, setActive] = useState(false)
  const inputRef = useRef(null)
  const controlRef = useRef(null)
  const nativeProps = {
    onPress: () => {
      setActive(true)
      inputRef.current.focus()
    },
  }
  const webProps = {
    onMouseDown: (event) => {
      if (!active) {
        event.preventDefault()
        setActive(true)
      }
    },
    onMouseUp: () => {
      if (active) {
        inputRef.current.focus()
      }
    },
    zIndex: active ? 'activeControl' : 'unset',
  }

  useEffect(() => {
    if (focusOnMount && !active && inputRef.current) {
      setActive(true)
      window.requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [])

  const TextInputComponent = rich ? RichTextInput : TextInput

  const _children = (
    <TextInputView
      active={active}
      flexGrow={1}
      labelOffset={labelProps ? labelProps.width : 0}
      modal={modal}
      smallText={theme.textVariants[inputVariant].fontSize < 16}
      controlRef={controlRef}
    >
      <TextInputComponent
        id={id}
        ref={inputRef}
        autoFocus={focusOnMount}
        onBlur={() => {
          window.requestAnimationFrame(() => setActive(false))
        }}
        onChange={onChange}
        active={active}
        value={value}
        color={active ? activeLabelColor : 'text.0'}
        multiline={multiline}
        variant={inputVariant}
        placeholder={placeholder}
        data-test-id={dataTestId}
        {...inputProps}
      />
    </TextInputView>
  )

  return (
    <BaseControl
      ref={controlRef}
      renderAsView
      active={active}
      tabIndex={-1}
      userSelect="auto"
      onFocus={() => {
        if (!active && inputRef.current?.focus) {
          inputRef.current.focus()
          window.requestAnimationFrame(() => setActive(true))
        }
      }}
      hoverColor="background.2"
      css={[
        {
          borderWidth: 0,
          position: active ? 'relative' : 'static',
          // '&:hover': {
          //   backgroundColor: colors.gray[6],
          // },
        },
        css,
      ]}
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...others}
    >
      {label && label.length ? (
        <Grid
          singleRow
          alignItems="baseline"
          flexWrap={gridFlexWrap}
          columnGap="small"
        >
          <View {...labelProps} css={{ userSelect: 'none' }}>
            <Text
              variant={labelVariant}
              color={active ? activeLabelColor : labelColor}
            >
              {label}
            </Text>
          </View>
          {_children}
        </Grid>
      ) : (
        _children
      )}
    </BaseControl>
  )
}

TextControl.defaultProps = {
  labelVariant: 'uiTextSmall',
  labelColor: 'text.3',
  activeLabelColor: 'text.2',
  inputVariant: isMobileOs() ? 'bodySmall' : 'uiTextNormal',
  gridFlexWrap: 'wrap',
  labelProps: {},
}
export default TextControl

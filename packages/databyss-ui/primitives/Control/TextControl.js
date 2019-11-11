import React, { useState, useRef } from 'react'
import BaseControl from './BaseControl'
import TextInput from './native/TextInput'
import RichTextInput from './native/RichTextInput'
// simport RichLineInput from './native/RichLineInput'

import TextInputView from './native/TextInputView'
import { View, Text, Grid } from '../'
import IS_NATIVE from '../../lib/isNative'
import theme from '../../theming/theme'

const TextControl = ({
  value,
  onChange,
  label,
  labelProps,
  labelColor,
  textVariant,
  id,
  gridFlexWrap,
  rich,
  modal,
  multiline,
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
    onMouseDown: event => {
      if (!active) {
        event.preventDefault()
        setActive(true)
      }
    },
    onMouseUp: event => {
      event.preventDefault()
      if (active) {
        inputRef.current.focus()
      }
    },
    zIndex: active ? 2 : 'unset',
  }
  const TextInputComponent = rich ? RichTextInput : TextInput

  const _children = (
    <TextInputView
      active={active}
      flexGrow={1}
      labelOffset={labelProps ? labelProps.width : 0}
      modal={modal}
      smallText={theme.textVariants[textVariant].fontSize < 16}
      controlRef={controlRef}
    >
      <TextInputComponent
        id={id}
        ref={inputRef}
        active={active}
        onBlur={() => {
          setTimeout(() => setActive(false), 50)
        }}
        onChange={onChange}
        variant={textVariant}
        value={value}
        multiline={multiline}
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
        if (!active && inputRef.current) {
          setTimeout(() => setActive(true), 50)
          inputRef.current.focus()
        }
      }}
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...others}
    >
      {label && label.length ? (
        <Grid
          singleRow
          alignItems="baseline"
          flexWrap={gridFlexWrap}
          columnGap="none"
        >
          <View {...labelProps} css={{ userSelect: 'none' }}>
            <Text variant={textVariant} color={labelColor}>
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
  textVariant: 'uiTextSmall',
  labelColor: 'text.0',
  gridFlexWrap: 'wrap',
  labelProps: {},
}
export default TextControl

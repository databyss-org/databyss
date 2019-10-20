import React, { useState, useRef } from 'react'
import BaseControl from './BaseControl'
import TextInput from './native/TextInput'
import RichTextInput from './native/RichTextInput'
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
      <Grid singleRow alignItems="baseline" flexWrap={gridFlexWrap}>
        {label &&
          label.length && (
            <View {...labelProps} css={{ userSelect: 'none' }}>
              <Text variant={textVariant} color={labelColor}>
                {label}
              </Text>
            </View>
          )}
        <TextInputView
          active={active}
          flexGrow={1}
          label={label}
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
      </Grid>
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

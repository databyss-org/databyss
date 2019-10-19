import React, { useState, useRef } from 'react'
import BaseControl from './BaseControl'
import TextInput from './native/TextInput'
import TextInputView from './native/TextInputView'
import { View, Text, Grid } from '../'
import IS_NATIVE from '../../lib/isNative'

const TextControl = ({
  value,
  onChange,
  label,
  labelProps,
  labelColor,
  textVariant,
  id,
  gridFlexWrap,
  ...others
}) => {
  const [active, setActive] = useState(false)
  const inputRef = useRef(null)
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
    onPress: event => {
      event.preventDefault()
    },
  }
  return (
    <BaseControl
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
        <TextInputView active={active} flexGrow={1} label={label}>
          <TextInput
            id={id}
            ref={inputRef}
            active={active}
            onBlur={() => {
              setTimeout(() => setActive(false), 50)
            }}
            onChange={onChange}
            variant={textVariant}
            value={value}
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
}
export default TextControl

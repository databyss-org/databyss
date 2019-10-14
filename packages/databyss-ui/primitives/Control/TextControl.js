import React, { useState, useRef } from 'react'
import BaseControl from './BaseControl'
import TextInput from './native/TextInput'
import TextInputView from './native/TextInputView'
import { View, Text, Grid } from '../'

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
  return (
    <BaseControl
      active={active}
      overflow="visible"
      onPress={event => {
        event.preventDefault()
        setTimeout(() => setActive(true), 50)
        inputRef.current.focus()
      }}
      {...others}
    >
      <Grid
        singleRow
        alignItems="baseline"
        overflow="visible"
        flexWrap={gridFlexWrap}
      >
        {label &&
          label.length && (
            <View {...labelProps}>
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
              setActive(false)
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

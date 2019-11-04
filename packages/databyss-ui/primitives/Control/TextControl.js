import React, { useState, useRef } from 'react'
import BaseControl from './BaseControl'
import TextInput from './native/TextInput'
import RichTextInput from './native/RichTextInput'
import TextInputView from './native/TextInputView'
import { View, Text, Grid } from '../'
import IS_NATIVE from '../../lib/isNative'
import theme from '../../theming/theme'
import { isMobileOs } from '../../lib/mediaQuery'

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
      smallText={theme.textVariants[inputVariant].fontSize < 16}
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
        value={value}
        multiline={multiline}
        variant={inputVariant}
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
          columnGap="small"
          marginLeft={isMobileOs() ? 'small' : 'none'}
          marginRight={isMobileOs() ? 'small' : 'none'}
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
  inputVariant: isMobileOs() ? 'bodySmall' : 'bodyNormal',
  gridFlexWrap: 'wrap',
  labelProps: {},
}
export default TextControl

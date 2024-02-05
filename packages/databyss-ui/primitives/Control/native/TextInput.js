import React, { forwardRef, useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import styled from '../../styled'
import { styleProps } from '../../Text/Text'

const resetProps = {
  padding: 0,
  margin: 0,
  bg: 'transparent',
}
const resetCss = {
  border: 0,
  outline: 'none',
  resize: 'none',
}

const StyledInput = styled('input', styleProps)
const StyledDiv = styled('div', styleProps)

const AutosizeInput = forwardRef(
  ({ concatCss, value, variant, placeholder, ...props }, ref) => {
    const [textWidth, setTextWidth] = useState(null)
    const _css = [resetCss].concat(concatCss)
    const textRef = useRef(null)

    const sizerCss = {
      position: 'absolute',
      top: 0,
      left: 0,
      visibility: 'hidden',
      height: 0,
      overflow: 'scroll',
      whiteSpace: 'pre',
    }

    useEffect(() => {
      if (!textRef.current) {
        return
      }
      // console.log('[TextInput] textRef', textRef.current.offsetWidth)
      setTextWidth(textRef.current.offsetWidth)
    }, [textRef.current, value])

    return (
      <>
        <StyledInput
          ref={ref}
          css={
            textWidth
              ? {
                  ..._css,
                  width: textWidth,
                }
              : _css
          }
          value={value}
          variant={variant}
          placeholder={placeholder}
          {...props}
        />
        <StyledDiv
          ref={textRef}
          variant={variant}
          css={[_css].concat(sizerCss)}
        >
          {value.length ? value : placeholder}
        </StyledDiv>
      </>
    )
  }
)

const StyledAutosizeInput = styled(AutosizeInput, styleProps)
const StyledTextarea = styled(Textarea, styleProps)

const TextInput = forwardRef(
  (
    {
      value,
      onChange,
      multiline,
      active,
      concatCss,
      readonly,
      autoFocus,
      autoSize,
      ...others
    },
    ref
  ) => {
    const STYLED_INPUT = autoSize ? StyledAutosizeInput : StyledInput
    if (multiline) {
      return (
        <StyledTextarea
          readOnly={readonly}
          onChange={(e) => onChange({ textValue: e.target.value })}
          ref={ref}
          css={[resetCss].concat(concatCss)}
          value={value.textValue}
          autoFocus={autoFocus}
          active={active || undefined}
          {...resetProps}
          {...others}
        />
      )
    }

    return (
      <STYLED_INPUT
        readOnly={readonly}
        type="text"
        value={value.textValue}
        onChange={(e) => onChange({ textValue: e.target.value })}
        ref={ref}
        css={[resetCss].concat(concatCss)}
        autoFocus={autoFocus}
        {...resetProps}
        {...others}
      />
    )
  }
)

TextInput.defaultProps = {
  color: 'text.0',
  variant: 'bodyNormal',
}

export default TextInput

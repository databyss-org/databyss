import React, {
  forwardRef,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { View, TextInput } from '@databyss-org/ui/primitives'
import { theme } from '@databyss-org/ui/theming'
import forkRef from '@databyss-org/ui/lib/forkRef'
import styledCss from '@styled-system/css'
import { Text } from '@databyss-org/editor/interfaces'
import { isMobile } from '../../lib/mediaQuery'

interface TitleInputProps {
  /**
   * If true, will set focus on itself if the title matches the placeholder.
   * Defaults to true
   */
  autoFocus?: boolean
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  readonly?: boolean
  icon?: ReactElement
  onKeyDown?: (evt: KeyboardEvent) => void
}

export const TitleInput = forwardRef<HTMLElement, TitleInputProps>(
  ({ 
    placeholder, 
    autoFocus, 
    value, 
    onChange, 
    icon, 
    onKeyDown, 
    ...others 
  }, ref) => {
    const inputRef = useRef<HTMLElement>(null)
    useEffect(() => {
      if (!autoFocus || !inputRef) {
        return
      }
      if (value === placeholder) {
        setTimeout(() => {
          inputRef.current!.focus()
        }, 10)
      }
    }, [inputRef.current])

    const onTextInputChange = useCallback(
      (value: Text) =>
        onChange!(value.textValue === '' ? placeholder! : value.textValue),
      [onChange]
    )

    const onTextInputKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault()
        }
        if (onKeyDown) {
          onKeyDown(event)
        }
      }, [onKeyDown]
    )

    let _value = value
    if (_value === placeholder) {
      _value = ''
    }

    return (
      <View
        flexGrow={0}
        justifyContent="center"
        mb={isMobile() ? 'small' : 'none'}
        position="relative"
      >
        {icon &&
          React.cloneElement(icon, {
            position: 'absolute',
            left: 'largeNegative',
            top: 'tiny',
            color: 'gray.5',
            sizeVariant: 'medium',
          })}
        <TextInput
          ref={forkRef(inputRef, ref)}
          value={{ textValue: _value }}
          onChange={onTextInputChange}
          onKeyDown={onTextInputKeyDown}
          placeholder={placeholder}
          variant="bodyHeading1"
          color="text.3"
          concatCss={styledCss({
            '::placeholder': {
              color: 'text.3',
              opacity: 0.6,
            },
          })(theme)}
          multiline
          {...others}
        />
      </View>
    )
  }
)

TitleInput.defaultProps = {
  autoFocus: true,
  placeholder: 'untitled',
}

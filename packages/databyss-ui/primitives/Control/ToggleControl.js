import React from 'react'
import BaseControl from './BaseControl'
import { View, Text } from '../'

/**
 * Base component for boolean selection controls. Optionally renders a label
 */
const ToggleControl = ({
  value,
  children,
  onChange,
  disabled,
  label,
  alignLabel,
  ...others
}) => (
  <BaseControl
    containerProps={
      label && label.length
        ? {
            flexDirection: alignLabel === 'left' ? 'row-reverse' : 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
          }
        : {}
    }
    onPress={onChange && (() => onChange(!value))}
    disabled={disabled}
    label={label}
    {...others}
  >
    {children}
    {label &&
      label.length && (
        <View {...{ [alignLabel === 'right' ? 'ml' : 'mr']: 'small' }}>
          <Text variant="uiTextNormal">{label}</Text>
        </View>
      )}
  </BaseControl>
)

ToggleControl.defaultProps = {
  alignLabel: 'right',
}

export default ToggleControl

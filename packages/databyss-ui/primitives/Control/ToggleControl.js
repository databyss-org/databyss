import React from 'react'
// import { Platform } from 'react-native'
import Control from './Control'

/**
 * Base component for boolean selection controls
 */
const ToggleControl = ({
  value,
  children,
  onChange,
  disabled,
  label,
  ...others
}) => {
  const sharedProps = {
    onPress: onChange && (() => onChange(!value)),
  }
  return (
    <Control {...sharedProps} {...others} disabled={disabled} label={label}>
      {children}
    </Control>
  )
}

ToggleControl.defaultProps = {
  label: true,
}

export default ToggleControl

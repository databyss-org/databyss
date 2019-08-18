import React from 'react'
import ToggleControl from './ToggleControl'
import Switch from './native/Switch'

/**
 * Render native switch on native, styled toggle control on web
 */
const SwitchControl = ({ value, onChange, label, ...others }) => (
  <ToggleControl value={value} onChange={onChange} label={label} {...others}>
    <Switch
      value={value}
      onValueChange={onChange && (() => onChange(!value))}
    />
  </ToggleControl>
)

SwitchControl.defaultProps = {
  label: true,
}

export default SwitchControl

import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import Control from './Control'
import styles from './styles'

/**
 * Base component for boolean selection controls
 */
const ToggleControl = ({
  classes,
  className,
  checked,
  children,
  onChange,
  ...props
}) => (
  <Control {...props} className={classnames(className, classes.toggleControl)}>
    <input
      type="checkbox"
      checked={checked}
      onClick={e => {
        if (onChange) {
          onChange(e.target.checked)
        }
      }}
    />
    {children}
  </Control>
)

export default injectSheet(styles)(ToggleControl)

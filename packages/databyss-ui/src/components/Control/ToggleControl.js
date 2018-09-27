import React from 'react'
import classnames from 'classnames'
import Control from './Control'
import styles from './styles.scss'

/**
 * Base component for boolean selection controls
 */
export default ({ className, checked, children, onChange, ...props }) => (
  <Control {...props} className={classnames(className, styles.toggleControl)}>
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

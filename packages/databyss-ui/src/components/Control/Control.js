/* eslint-disable jsx-a11y/label-has-for */

import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

/**
 * Base Control component. Optionally renders a label and handles disabled state
 */
export default ({ className, children, style, disabled, label }) => (
  <label
    className={classnames(className, styles.control, {
      [styles.disabled]: disabled,
    })}
    style={style}
  >
    {label && <div className={styles.label}>{label}</div>}
    {React.Children.map(
      children,
      child => child && React.cloneElement(child, { disabled })
    )}
  </label>
)

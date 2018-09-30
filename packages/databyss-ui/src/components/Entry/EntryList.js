import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style, ariaLabel }) => (
  <div
    role="region"
    aria-label={ariaLabel ? `entries for ${ariaLabel}` : `entries`}
    className={classnames(className, styles.entryList)}
    style={style}
  >
    {children}
  </div>
)

import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style, ariaLabel }) => (
  <div
    role="region"
    aria-label={`entries for ${ariaLabel}`}
    className={classnames(className, styles.entryList)}
    style={style}
  >
    {children}
  </div>
)

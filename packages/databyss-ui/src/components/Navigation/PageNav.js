import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style, ariaLabel }) => (
  <nav
    aria-label={ariaLabel}
    className={classnames(className, styles.pageNav)}
    style={style}
  >
    {children}
  </nav>
)

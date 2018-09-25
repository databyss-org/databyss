import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style }) => (
  <div
    role="heading"
    aria-level="1"
    className={classnames(className, styles.pageHeading)}
    style={style}
  >
    {children}
  </div>
)

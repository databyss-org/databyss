import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style }) => (
  <div
    role="heading"
    aria-level="2"
    className={classnames(className, styles.pageSubHeading)}
    style={style}
  >
    {children}
  </div>
)

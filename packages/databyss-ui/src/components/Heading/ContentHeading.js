import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style }) => (
  <div
    role="banner"
    className={classnames(className, styles.contentHeading)}
    style={style}
  >
    <div role="heading" aria-level="3" className={styles.text}>
      {children}
    </div>
  </div>
)

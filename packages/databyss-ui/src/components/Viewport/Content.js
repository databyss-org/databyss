import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style, ariaLabel }) => (
  <div
    role="region"
    aria-label={ariaLabel || 'content'}
    className={classnames(className, styles.content)}
    style={style}
  >
    {children}
  </div>
)

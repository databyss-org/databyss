import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style }) => (
  <div
    role="cell"
    className={classnames([className, styles.content])}
    style={style}
  >
    {children}
  </div>
)

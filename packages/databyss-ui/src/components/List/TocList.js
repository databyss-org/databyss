import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, children, style, ariaLabel }) => (
  <div
    role="list"
    aria-label={ariaLabel}
    className={classnames(className, styles.tocList)}
    style={style}
  >
    {React.Children.map(children, child => (
      <div role="listitem" className={styles.item}>
        {child}
      </div>
    ))}
  </div>
)

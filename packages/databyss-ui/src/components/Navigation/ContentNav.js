import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({ className, style, left, right, children }) => (
  <div
    role="region"
    className={classnames(className, styles.contentNav)}
    style={style}
    aria-label="content"
  >
    <nav aria-label="content navigator" className={styles.nav}>
      <div role="list" className={styles.list}>
        <div role="listitem" className={styles.left}>
          {left}
        </div>
        <div role="listitem" className={styles.right}>
          {right}
        </div>
      </div>
    </nav>
    {children}
  </div>
)

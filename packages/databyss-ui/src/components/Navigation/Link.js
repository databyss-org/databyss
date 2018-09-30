import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default ({
  className,
  children,
  style,
  inline = true,
  href = '#',
  onClick,
}) => (
  <a
    className={classnames(className, styles.link, { [styles.inline]: inline })}
    style={style}
    href={href}
    onClick={e => {
      e.preventDefault()
      if (onClick) {
        onClick(e)
      }
    }}
  >
    {children}
  </a>
)

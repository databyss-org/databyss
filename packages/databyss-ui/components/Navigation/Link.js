import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const Link = ({
  classes,
  className,
  children,
  style,
  inline = true,
  href = '#',
  onClick,
}) => (
  <a
    className={classnames(className, classes.link, {
      [classes.inline]: inline,
    })}
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

export default injectSheet(styles)(Link)

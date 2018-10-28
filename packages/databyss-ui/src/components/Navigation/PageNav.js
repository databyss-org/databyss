import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const PageNav = ({ classes, className, children, style, ariaLabel }) => (
  <nav
    aria-label={ariaLabel}
    className={classnames(className, classes.pageNav)}
    style={style}
  >
    {children}
  </nav>
)

export default injectSheet(styles)(PageNav)

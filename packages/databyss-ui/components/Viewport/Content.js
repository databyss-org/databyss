import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const Content = ({ classes, className, children, style, ariaLabel, _ref }) => (
  <div
    ref={_ref}
    aria-label={ariaLabel || 'content'}
    className={classnames(className, classes.content)}
    style={style}
  >
    {children}
  </div>
)

export default injectSheet(styles)(Content)

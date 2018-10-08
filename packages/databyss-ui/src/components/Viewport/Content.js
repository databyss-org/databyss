import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const Content = ({ className, children, style, ariaLabel }) => (
  <div
    aria-label={ariaLabel || 'content'}
    className={classnames(className, styles.content)}
    style={style}
  >
    {children}
  </div>
)

export default injectSheet(styles)(Content)

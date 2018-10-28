import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const PageHeading = ({ classes, className, children, style }) => (
  <div
    role="heading"
    aria-level="1"
    className={classnames(className, classes.pageHeading)}
    style={style}
  >
    {children}
  </div>
)

export default injectSheet(styles)(PageHeading)

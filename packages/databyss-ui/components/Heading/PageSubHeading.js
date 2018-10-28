import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const PageSubHeading = ({ classes, className, children, style }) => (
  <div
    role="heading"
    aria-level="2"
    className={classnames(className, classes.pageSubHeading)}
    style={style}
  >
    {children}
  </div>
)

export default injectSheet(styles)(PageSubHeading)

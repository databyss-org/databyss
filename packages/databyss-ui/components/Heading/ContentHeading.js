import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const ContentHeading = ({ classes, className, children, style, id }) => (
  <div
    id={id}
    role="banner"
    className={classnames(className, classes.contentHeading)}
    style={style}
  >
    <div role="heading" aria-level="3" className={classes.text}>
      {children}
    </div>
  </div>
)

export default injectSheet(styles)(ContentHeading)

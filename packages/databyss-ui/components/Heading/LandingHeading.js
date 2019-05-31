import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const LandingHeading = ({
  classes,
  className,
  children,
  style,
  left,
  right,
  id,
}) => (
  <div
    id={id}
    className={classnames(className, classes.landingHeader)}
    style={style}
  >
    <div className={classes.headingContainer}>
      <div
        className={classnames(right ? classes.titleWithToggle : classes.title)}
      >
        {left}
      </div>
      <div className={classes.toggle}>{right}</div>
    </div>
    {children}
  </div>
)

export default injectSheet(styles)(LandingHeading)

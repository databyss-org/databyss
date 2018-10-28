import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import ToggleControl from './ToggleControl'
import styles from './styles'

const SwitchControl = ({ classes, className, ...props }) => (
  <ToggleControl
    {...props}
    className={classnames(className, classes.switchControl)}
  >
    <div className={classes.switchHandle} />
  </ToggleControl>
)

export default injectSheet(styles)(SwitchControl)

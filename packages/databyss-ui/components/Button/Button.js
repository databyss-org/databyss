import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import Control from '../Control/Control'
import styles from './styles'

const Button = ({ classes, className, children, ...others }) => (
  <Control
    Tag="button"
    className={classnames(className, classes.button)}
    {...others}
  >
    {children}
  </Control>
)

export default injectSheet(styles)(Button)

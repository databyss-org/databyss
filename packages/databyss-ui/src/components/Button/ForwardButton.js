import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'
import Button from './Button'
import ArrowSvg from '../../assets/arrow.svg'

const ForwardButton = ({ classes, className, ...others }) => (
  <Button className={classnames(className, classes.forwardButton)} {...others}>
    <ArrowSvg />
  </Button>
)

export default injectSheet(styles)(ForwardButton)

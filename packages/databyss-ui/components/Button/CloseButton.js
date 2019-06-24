import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'
import Button from './Button'
import Close from '../../assets/close.svg'

const CloseButton = ({ classes, className, ...others }) => (
  <Button className={classnames(className, classes.closeButton)} {...others}>
    <Close />
  </Button>
)

export default injectSheet(styles)(CloseButton)

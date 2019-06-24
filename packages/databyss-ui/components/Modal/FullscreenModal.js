import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import Modal from './Modal'
import styles from './styles'

const FullscreenModal = ({ classes, className, children, ...others }) => (
  <Modal
    className={classnames(className, classes.fullscreen)}
    showCloseButton
    classes={classes}
    fullscreen
    {...others}
  >
    {children}
  </Modal>
)

export default injectSheet(styles)(FullscreenModal)

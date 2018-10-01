import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'
import BackButton from './BackButton'

export default ({ className, onClick, children, ...others }) => (
  <BackButton
    className={classnames(className, styles.forwardButton)}
    onClick={onClick}
    {...others}
  >
    {children}
  </BackButton>
)

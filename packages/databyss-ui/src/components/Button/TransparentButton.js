import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'
import Button from './Button'

export default ({ className, children, ...others }) => (
  <Button
    className={classnames(className, styles.transparentButton)}
    {...others}
  >
    {children}
  </Button>
)

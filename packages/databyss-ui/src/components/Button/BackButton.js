import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'
import TransparentButton from './TransparentButton'
import ArrowSvg from '../../assets/arrow.svg'

export default ({ className, onClick, children, ...others }) => (
  <TransparentButton
    className={classnames(className, styles.backButton)}
    onClick={onClick}
    {...others}
  >
    <ArrowSvg />
    {children}
  </TransparentButton>
)

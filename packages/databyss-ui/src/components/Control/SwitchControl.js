import React from 'react'
import classnames from 'classnames'
import ToggleControl from './ToggleControl'
import styles from './styles.scss'

export default ({ className, ...props }) => (
  <ToggleControl
    {...props}
    className={classnames(className, styles.switchControl)}
  >
    <div className={styles.switch} />
  </ToggleControl>
)

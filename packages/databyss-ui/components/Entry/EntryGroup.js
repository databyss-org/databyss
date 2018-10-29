import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const EntryGroup = ({ className, children, style, ariaLabel, classes }) => (
  <div
    aria-label={ariaLabel ? `entries for ${ariaLabel}` : `entries`}
    className={classnames(className, classes.entryList)}
    style={style}
  >
    {children}
  </div>
)

export default injectSheet(styles)(EntryGroup)

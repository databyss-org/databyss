import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const ContentNav = ({ classes, className, style, left, right, children }) => (
  <div
    className={classnames(className, classes.contentNav)}
    style={style}
    aria-label="content"
  >
    <nav aria-label="content navigator" className={classes.nav}>
      <div className={classes.list}>
        <div className={classes.left}>{left}</div>
        <div className={classes.right}>{right}</div>
      </div>
    </nav>
    {children}
  </div>
)

export default injectSheet(styles)(ContentNav)

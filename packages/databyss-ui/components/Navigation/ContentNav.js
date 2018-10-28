import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const ContentNav = ({ classes, className, style, left, right, children }) => (
  <div
    role="region"
    className={classnames(className, classes.contentNav)}
    style={style}
    aria-label="content"
  >
    <nav aria-label="content navigator" className={classes.nav}>
      <div role="list" className={classes.list}>
        <div role="listitem" className={classes.left}>
          {left}
        </div>
        <div role="listitem" className={classes.right}>
          {right}
        </div>
      </div>
    </nav>
    {children}
  </div>
)

export default injectSheet(styles)(ContentNav)

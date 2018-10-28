import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const TocList = ({ classes, className, children, style, ariaLabel }) => (
  <div
    role="list"
    aria-label={ariaLabel}
    className={classnames(className, classes.tocList)}
    style={style}
  >
    {React.Children.map(children, child => (
      <div role="listitem" className={classes.item}>
        {child}
      </div>
    ))}
  </div>
)

export default injectSheet(styles)(TocList)

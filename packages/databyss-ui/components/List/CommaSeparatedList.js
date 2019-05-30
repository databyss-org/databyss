import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const CommaSeparatedList = ({
  classes,
  className,
  children,
  style,
  ariaLabel,
  opener,
  closer,
}) => (
  <div
    role="list"
    aria-label={ariaLabel}
    className={classnames(className, classes.commaSeparatedList)}
    style={style}
  >
    {opener}
    {React.Children.map(children, (child, idx) => [
      <div role="listitem" className={classes.listItem}>
        {child}
      </div>,
      idx === children.length - 1 ? closer : null,
    ])}
  </div>
)

export default injectSheet(styles)(CommaSeparatedList)

import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

const PageSubHeading = ({
  classes,
  className,
  children,
  style,
  inStickyContainer,
  headerSticky,
  sourceHeader,
}) => {
  const motifOrSourceSticky = !sourceHeader
    ? classes.headerPageSubHeadingSticky
    : classes.headerPageSubHeadingStickySource
  const motifOrSource = !sourceHeader
    ? classes.headerPageSubHeading
    : classes.headerPageSubHeadingSource

  return (
    <div
      role="heading"
      aria-level="2"
      className={classnames(
        className,
        !headerSticky && !inStickyContainer
          ? motifOrSource
          : motifOrSourceSticky
      )}
      style={style}
    >
      {children}
    </div>
  )
}

export default injectSheet(styles)(PageSubHeading)

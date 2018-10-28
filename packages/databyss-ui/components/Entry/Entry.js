import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import Raw from '../Viewport/Raw'
import styles from './styles'

const Entry = ({
  className,
  style,
  content,
  location,
  source,
  isStarred,
  locationIsRepeat,
  sourceIsRepeat,
  classes,
}) => (
  <article aria-label="entry" className={classnames(className, classes.entry)}>
    {source &&
      !sourceIsRepeat && (
        <div aria-label="entry source" className={classes.source}>
          {source.display.trim()}
        </div>
      )}
    {isStarred && (
      <div aria-label="entry emphasis" className={classes.emphasis}>
        ***
      </div>
    )}
    {location && (
      <div
        aria-label="entry location"
        className={classnames(classes.location, {
          [classes.locationRepeat]: locationIsRepeat,
        })}
      >
        {locationIsRepeat ? '—— ' : location.trim()}
      </div>
    )}
    <Raw className={classes.content} style={style} html={content.trim()} />
  </article>
)

export default injectSheet(styles)(Entry)

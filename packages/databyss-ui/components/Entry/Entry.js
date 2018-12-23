import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import EntrySource from './EntrySource'
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
  onSourceClick,
  sourceHref,
}) => (
  <article aria-label="entry" className={classnames(className, classes.entry)}>
    {source &&
      !sourceIsRepeat && (
        <EntrySource onClick={onSourceClick} href={sourceHref} source={source}>
          {source.display.trim()}
        </EntrySource>
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

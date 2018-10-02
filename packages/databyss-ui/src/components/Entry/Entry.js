import React from 'react'
import classnames from 'classnames'
import Raw from '../Viewport/Raw'
import styles from './styles.scss'

export default ({
  className,
  style,
  content,
  location,
  source,
  isStarred,
  locationIsRepeat,
  sourceIsRepeat,
}) => (
  <article aria-label="entry" className={classnames(className, styles.entry)}>
    {source &&
      !sourceIsRepeat && (
        <div aria-label="entry source" className={styles.source}>
          {source.display.trim()}
        </div>
      )}
    {isStarred && (
      <div aria-label="entry emphasis" className={styles.emphasis}>
        ***
      </div>
    )}
    {location && (
      <div
        aria-label="entry location"
        className={classnames(styles.location, {
          [styles.locationRepeat]: locationIsRepeat,
        })}
      >
        {locationIsRepeat ? '—— ' : location.trim()}
      </div>
    )}
    <Raw className={styles.content} style={style} html={content.trim()} />
  </article>
)

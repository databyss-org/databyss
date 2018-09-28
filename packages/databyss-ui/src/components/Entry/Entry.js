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
  <div
    role="region"
    label="entry"
    className={classnames(className, styles.entry)}
  >
    {source &&
      !sourceIsRepeat && (
        <div
          label="entry source"
          className={styles.source}
          aria-label={source.title}
        >
          {source.display.trim()}
        </div>
      )}
    {isStarred && (
      <div label="entry emphasis" className={styles.emphasis}>
        ***
      </div>
    )}
    {location && (
      <div
        label="entry location"
        className={classnames(styles.location, {
          [styles.locationRepeat]: locationIsRepeat,
        })}
      >
        {locationIsRepeat ? '—— ' : location.trim()}
      </div>
    )}
    <Raw
      className={styles.content}
      style={style}
      html={content.trim()}
      ariaLabel="entry content"
    />
  </div>
)

import React from 'react'
import classnames from 'classnames'
import Raw from '../Viewport/Raw'
import styles from './styles.scss'

export default ({ className, style, content }) => (
  <Raw
    className={classnames(className, styles.entry)}
    style={style}
    html={content}
    ariaRole="region"
    ariaLabel="entry"
  />
)

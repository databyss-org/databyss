import React from 'react'
import classnames from 'classnames'
import { isMobileOs } from '../../lib/mediaQuery'
import styles from './styles.scss'

export default class Viewport extends React.Component {
  componentWillMount() {
    document.documentElement.setAttribute(
      'data-user-agent',
      navigator.userAgent
    )
    if (isMobileOs()) {
      document.documentElement.setAttribute('data-mobile-user-agent', true)
    }
  }
  render() {
    const { className, children, style, isFullscreen } = this.props
    return (
      <main
        role="application"
        className={classnames([className, styles.viewport], {
          [styles.fullscreen]: isFullscreen,
        })}
        style={style}
      >
        {children}
      </main>
    )
  }
}

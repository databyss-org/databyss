import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

class EntrySource extends React.Component {
  onClick = e => {
    e.preventDefault()
    this.props.onClick()
  }
  render() {
    const { classes, className, children, style, href } = this.props
    return (
      <a
        style={style}
        aria-label="source"
        className={classnames(className, classes.source)}
        onClick={this.onClick}
        href={href}
      >
        {children}
      </a>
    )
  }
}

export default injectSheet(styles)(EntrySource)

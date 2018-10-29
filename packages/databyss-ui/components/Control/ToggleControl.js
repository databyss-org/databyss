import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import Control from './Control'
import styles from './styles'

/**
 * Base component for boolean selection controls
 */
class ToggleControl extends React.Component {
  state = {
    isFocused: false,
  }
  onChange = e => {
    if (this.props.onChange) {
      this.props.onChange(e.target.checked)
    }
  }
  onFocus = () => {
    this.setState({ isFocused: true })
  }
  onBlur = () => {
    this.setState({ isFocused: false })
  }
  render() {
    const { classes, className, checked, children } = this.props
    return (
      <Control
        {...this.props}
        className={classnames(className, classes.toggleControl)}
        focused={this.state.isFocused}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
        {children}
      </Control>
    )
  }
}

export default injectSheet(styles)(ToggleControl)

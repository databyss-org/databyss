import React from 'react'
import classnames from 'classnames'
import styles from './styles.scss'

export default class Button extends React.Component {
  state = {
    touchDecayActive: false,
  }
  onTouchStart = () => {
    this.setState({ touchDecayActive: true })
    clearTimeout(this.decayTimer)
    this.decayTimer = setTimeout(
      () => this.setState({ touchDecayActive: false }),
      this.props.touchDecayDuration
    )
  }
  render() {
    const { className, children, onClick, disabled } = this.props
    return (
      <button
        className={classnames(className, styles.button, {
          [styles.disabled]: disabled,
          [styles.touchDecay]: this.state.touchDecayActive,
        })}
        onClick={onClick}
        disabled={disabled}
        onTouchStart={this.onTouchStart}
        aria-label={this.props.ariaLabel}
      >
        {children}
      </button>
    )
  }
}

Button.defaultProps = {
  touchDecayDuration: 800,
}

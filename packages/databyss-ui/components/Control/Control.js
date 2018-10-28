import React from 'react'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import styles from './styles'

/**
 * Base Control component. Optionally renders a label and handles disabled state
 */
class Control extends React.Component {
  state = {
    touchDecayActive: false,
  }
  onTouchStart = () => {
    this.setState({ touchDecayActive: true })
    clearTimeout(this.decayTimer)
    this.decayTimer = setTimeout(
      () => this.setState({ touchDecayActive: false }),
      this.props.theme.touchDecayDuration
    )
  }
  render() {
    const {
      classes,
      className,
      children,
      style,
      disabled,
      label,
      Tag = 'label',
      onClick,
      ariaLabel,
    } = this.props
    return (
      <Tag
        className={classnames(className, classes.control, {
          [classes.disabled]: disabled,
          [classes.touchDecay]: this.state.touchDecayActive,
        })}
        style={style}
        disabled={disabled}
        tabIndex={0}
        onClick={onClick}
        onTouchStart={this.onTouchStart}
        aria-label={ariaLabel}
      >
        {label && <div className={classes.label}>{label}</div>}
        {React.Children.map(
          children,
          child => child && React.cloneElement(child, { disabled })
        )}
      </Tag>
    )
  }
}

export default injectSheet(styles)(Control)

import React from 'react'
import classnames from 'classnames'
import ReactModal from 'react-modal'
import ScrollLock from 'react-scrolllock'
import injectSheet from 'react-jss'
import CloseButton from '../Button/CloseButton'
import {
  getBodyScroll,
  setBodyScroll,
  lockBodyScrollToTop,
  unlockBodyScroll,
  setElementDisplayNone,
  restoreElementDisplay,
} from '../../lib/dom'
import { isMobileOrMobileOs } from '../../lib/mediaQuery'
import styles from './styles'

class Modal extends React.Component {
  static defaultProps = {
    okIsEnabled: true,
    cancelIsEnabled: true,
    shouldCloseOnEsc: true,
    hasEditableContent: false,
    standalone: false,
    wide: false,
    fitContent: false,
    contentHandlesScroll: false,
    okButtonWide: false,
  }
  constructor(props) {
    super(props)
    this.headerRef = React.createRef()
  }
  state = {
    contentContainerRef: null,
  }

  componentWillMount() {
    if (this.props.appElementId) {
      ReactModal.setAppElement(`#${this.props.appElementId}`)
    }
    if (this.shouldHideParent()) {
      this.bodyScrollPos = getBodyScroll()
      this.parentDisplay = setElementDisplayNone(`#${this.props.appElementId}`)
    }
    if (this.props.lockBodyScroll) {
      lockBodyScrollToTop()
    }
    this.viewportHeight = window.innerHeight
  }
  componentWillUnmount() {
    if (this.shouldHideParent()) {
      setBodyScroll(this.bodyScrollPos)
      restoreElementDisplay(`#${this.props.appElementId}`, this.parentDisplay)
    }
    if (this.props.lockBodyScroll) {
      unlockBodyScroll()
    }
    if (this.focusTrap) {
      this.focusTrap.deactivate()
    }
  }

  onContentContainerRef = ref => {
    if (this.props.contentContainerRef && ref) {
      this.props.contentContainerRef(ref)
    }
    if (!this.state.contentContainerRef) {
      this.setState({ contentContainerRef: ref })
    }
  }
  isMobileOrMobileOs = isMobileOrMobileOs()
  shouldHideParent = () => this.props.fullscreen
  render() {
    const {
      className,
      overlayClassName,
      children,
      showCloseButton,
      title,
      subtitle,
      onDismiss,
      shouldCloseOnEsc,
      hasEditableContent,
      cancelIsEnabled,
      classes,
      wide,
      fitContent,
      contentHandlesScroll,
      modalProps,
    } = this.props
    const modalPropsCombined = {
      isOpen: true,
      overlayClassName: classnames([overlayClassName, classes.overlay]),
      onRequestClose: onDismiss,
      shouldCloseOnEsc: shouldCloseOnEsc && cancelIsEnabled,
      shouldCloseOnOverlayClick: false,
      ...modalProps,
    }

    let headerHeight = 0
    if (this.headerRef.current) {
      headerHeight = this.headerRef.current.offsetHeight
    }
    return (
      <ReactModal
        className={classnames(className, classes.modal, {
          [classes.wide]: wide,
          [classes.fitContent]: fitContent,
          [classes.editable]: hasEditableContent,
          [classes.contentHandlesScroll]: contentHandlesScroll,
        })}
        {...modalPropsCombined}
      >
        <header className={classes.header} ref={this.headerRef}>
          <div role="heading" className={classes.title}>
            {title}
          </div>
          <div role="heading" className={classes.title}>
            {subtitle}
          </div>
          {// only show the close button to the right of the title
          showCloseButton && (
            <CloseButton
              style={{ color: 'black' }}
              className={classes.closeButton}
              onClick={onDismiss}
              tabIndex={0}
            />
          )}
        </header>
        <main
          style={{ paddingTop: headerHeight }}
          className={classnames(classes.content)}
          ref={this.onContentContainerRef}
        >
          {children}
        </main>
        {!this.isMobileOrMobileOs &&
          this.state.contentContainerRef && (
            <ScrollLock touchScrollTarget={this.state.contentContainerRef} />
          )}
      </ReactModal>
    )
  }
}

export default injectSheet(styles)(Modal)

import React from 'react'
import ReactModal from 'react-modal'
import { position, color, compose } from 'styled-system'
import css from '@styled-system/css'
import { isMobile } from '../../lib/mediaQuery'
import MobileModal from './MobileModal'
import { View } from '../'
import styled from '../styled'
import makeAnimations from './animations'
import theme from '../../theming/theme'

ReactModal.setAppElement('#root')

const StyledReactModal = styled(
  ReactModal,
  compose(
    position,
    color
  )
)

const Modal = ({ children, visible, onDismiss, ...others }) => {
  const animations = makeAnimations({
    slide: {
      '0%': {
        top: '100%',
      },
      '100%': {
        top: '0',
      },
    },
  })

  const sharedProps = {
    position: 'absolute',
    isOpen: visible,
  }
  const mobileCss = closing => ({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: closing ? '100%' : 0,
  })
  const desktopCss = {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'background.1',
    maxWidth: `calc(100% - ${theme.space[2] * 2}px)`,
  }
  const _mobile = isMobile()
  const _css = _mobile
    ? [
        mobileCss(animations.slide.outro.css),
        animations.slide.intro.css,
        animations.slide.outro.css,
      ]
    : css(desktopCss)

  const onClose = () => {
    if (!_mobile) {
      onDismiss()
      return
    }
    animations.slide.outro.run(onDismiss)
  }
  const onOpen = () => {
    if (!_mobile) {
      return
    }
    animations.slide.intro.run()
  }

  return (
    <StyledReactModal
      {...sharedProps}
      onAfterOpen={onOpen}
      onRequestClose={onClose}
      css={_css}
      style={{
        overlay: {
          backgroundColor: 'transparent',
        },
      }}
    >
      {isMobile() ? (
        <MobileModal {...others} onDismiss={onClose}>
          {children}
        </MobileModal>
      ) : (
        <View {...others}>{children}</View>
      )}
    </StyledReactModal>
  )
}

Modal.defaultProps = {
  onDismiss: () => null,
}

export default Modal

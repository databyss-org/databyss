import React from 'react'
import ReactModal from 'react-modal'
import { position, color, compose } from 'styled-system'
import css from '@styled-system/css'
import { isMobileOs } from '../../lib/mediaQuery'
import MobileModal from './MobileModal'
import { View } from '../'
import { shadowVariant } from '../View/View'
import styled from '../styled'
import makeAnimations from './animations'
import theme, { borderRadius } from '../../theming/theme'

const StyledReactModal = styled(
  ReactModal,
  compose(
    position,
    color,
    shadowVariant
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
    overflow: 'auto',
    top: closing ? '100%' : 0,
  })
  const desktopCss = {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'background.0',
    width: `calc(100% - ${theme.space[5] * 2}px)`,
    maxWidth: `850px`,
    maxHeight: `calc(100% - ${theme.space[5] * 2}px)`,
    overflow: 'auto',
    borderRadius,
  }
  const _mobile = isMobileOs()
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
      appElement={document.getElementById('root')}
      onAfterOpen={onOpen}
      onRequestClose={onClose}
      shadowVariant={_mobile ? 'none' : 'modal'}
      css={_css}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
        },
      }}
    >
      {_mobile ? (
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

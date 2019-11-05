import React from 'react'
import ReactModal from 'react-modal'
import { position, color, compose } from 'styled-system'
import css from '@styled-system/css'
import { isMobileOs } from '../../lib/mediaQuery'
import ModalView from './ModalView'
import { shadowVariant, widthVariant } from '../View/View'
import styled from '../styled'
import makeAnimations from './animations'
import theme, { borderRadius } from '../../theming/theme'

const StyledReactModal = styled(
  ReactModal,
  compose(
    position,
    color,
    shadowVariant,
    widthVariant
  )
)

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
  maxHeight: `calc(100% - ${theme.space[5] * 2}px)`,
  overflow: 'hidden',
  borderRadius,
  display: 'flex',
}
const _mobile = isMobileOs()

const Modal = ({ children, visible, onDismiss, widthVariant, ...others }) => {
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
      position="absolute"
      isOpen={visible}
      appElement={document.getElementById('root')}
      onAfterOpen={onOpen}
      onRequestClose={onClose}
      shadowVariant={_mobile ? 'none' : 'modal'}
      widthVariant={_mobile ? 'none' : widthVariant}
      css={_css}
      style={{
        overlay: {
          backgroundColor: _mobile ? 'transparent' : 'rgba(0, 0, 0, 0.35)',
          zIndex: 1,
          overflow: 'hidden',
        },
        content: {
          overflow: 'hidden',
        },
      }}
    >
      <ModalView {...others} onDismiss={onClose}>
        {children}
      </ModalView>
    </StyledReactModal>
  )
}

Modal.defaultProps = {
  onDismiss: () => null,
  widthVariant: 'modal',
}

export default Modal

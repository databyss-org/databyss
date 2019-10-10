import React from 'react'
import ReactModal from 'react-modal'
import { position } from 'styled-system'
import { isMobile } from '../../lib/mediaQuery'
import MobileModal from './MobileModal'
import styled from '../styled'
import makeAnimations from './animations'

ReactModal.setAppElement('#root')

const StyledReactModal = styled(ReactModal, position)

const Modal = ({ children, visible, onDismiss, ...others }) => {
  const animations = makeAnimations()

  const sharedProps = {
    isOpen: visible,
  }
  const mobileProps = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  }
  const mobileCss = {}
  const desktopProps = {}
  return (
    <StyledReactModal
      {...sharedProps}
      {...(isMobile() ? mobileProps : desktopProps)}
      onAfterOpen={() => animations.slide.run('intro')}
      onRequestClose={() => {
        animations.slide.run('outro', () => {
          if (onDismiss) {
            onDismiss()
          }
        })
      }}
      css={[
        isMobile() && mobileCss,
        isMobile() && animations.slide.getCssFor('intro'),
        isMobile() && animations.slide.getCssFor('outro'),
      ]}
    >
      {isMobile() ? (
        <MobileModal {...others}>{children}</MobileModal>
      ) : (
        children
      )}
    </StyledReactModal>
  )
}
export default Modal

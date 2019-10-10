import React from 'react'
import ReactModal from 'react-modal'
import { position } from 'styled-system'
import { isMobile } from '../../lib/mediaQuery'
import MobileModal from './MobileModal'
import styled from '../styled'

const StyledReactModal = styled(ReactModal, position)

const Modal = ({ children, visible, ...others }) => {
  const sharedProps = {
    isOpen: visible,
  }
  const mobileProps = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }
  const desktopProps = {}
  return (
    <StyledReactModal
      {...sharedProps}
      {...(isMobile() ? mobileProps : desktopProps)}
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

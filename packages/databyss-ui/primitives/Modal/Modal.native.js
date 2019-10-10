import React from 'react'
import { Modal as NativeModal, SafeAreaView } from 'react-native'
import { color, flexbox, compose } from 'styled-system'
import MobileModal from './MobileModal'
import styled from '../styled'

const StyledSafeArea = styled(
  SafeAreaView,
  compose(
    color,
    flexbox
  )
)

const Modal = ({ visible, title, children }) => (
  <NativeModal visible={visible} animationType="slide">
    <StyledSafeArea flex={1} bg="background.0">
      <MobileModal title={title}>{children}</MobileModal>
    </StyledSafeArea>
  </NativeModal>
)

export default Modal

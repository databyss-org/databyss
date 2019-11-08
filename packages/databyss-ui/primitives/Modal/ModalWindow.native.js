import React from 'react'
import { Modal as NativeModal, SafeAreaView } from 'react-native'
import { color, flexbox, compose } from 'styled-system'
import ModalView from './ModalView'
import styled from '../styled'

const StyledSafeArea = styled(
  SafeAreaView,
  compose(
    color,
    flexbox
  )
)

const ModalWindow = ({ visible, children, ...others }) => (
  <NativeModal visible={visible} animationType="slide">
    <StyledSafeArea flex={1} bg="background.0">
      <ModalView {...others}>{children}</ModalView>
    </StyledSafeArea>
  </NativeModal>
)

export default ModalWindow

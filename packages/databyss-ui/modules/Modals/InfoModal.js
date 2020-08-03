import React from 'react'

import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

import { ModalWindow, Text } from '../../primitives'

const InfoModal = ({ id, visible, heading, message }) => {
  const { hideModal } = useNavigationContext()

  const onDismiss = () => {
    // FIXME: does not hide modal
    hideModal()
  }

  const render = () => (
    <ModalWindow
      visible={visible}
      key={id}
      onDismiss={onDismiss}
      title={heading}
      widthVariant="dialog"
      dismissChild="OK"
    >
      <Text variant="bodyNormal">{message}</Text>
    </ModalWindow>
  )

  return render()
}

export default InfoModal

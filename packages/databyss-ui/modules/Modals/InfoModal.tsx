import React from 'react'

import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

import { ModalWindow, Text } from '../../primitives'

const InfoModal = ({
  id,
  visible,
  heading,
  message,
}: {
  id: string
  visible: boolean
  heading: string
  message: string
}) => {
  const { hideModal } = useNavigationContext()

  const render = () => (
    <ModalWindow
      visible={visible}
      key={id}
      onDismiss={hideModal}
      title={heading}
      widthVariant="dialog"
      dismissChild="OK"
      canDismiss
    >
      <Text variant="bodyNormal">{message}</Text>
    </ModalWindow>
  )

  return render()
}

export default InfoModal

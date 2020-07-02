import React from 'react'
import componentMap from './componentMap'
import { useNavigationContext } from '../../components/Navigation/NavigationProvider'

const ModalManager = () => {
  const modals = useNavigationContext(c => c.modals)
  return modals.map((modal, i) => {
    const ModalComponent = componentMap[modal.component]
    return <ModalComponent visible={modal.visible} key={i} {...modal.props} />
  })
}

export default ModalManager

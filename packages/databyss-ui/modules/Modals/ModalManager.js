import React from 'react'
import modalMap from './modalMap'
import { useNavigationContext } from '../../components/Navigation/NavigationProvider'

/**
 * Registers modals so they are easily shown from anywhere.
 * For example: `showModal({ component: TOPIC })`
 *
 * Whenever new modals are created, ensure to add them to the `modalMap`.
 */
const ModalManager = () => {
  const modals = useNavigationContext((c) => c.modals)
  return modals.map((modal, i) => {
    const ModalComponent = modalMap[modal.component]
    return <ModalComponent visible={modal.visible} key={i} {...modal.props} />
  })
}

export default ModalManager

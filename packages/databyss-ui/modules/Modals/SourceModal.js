import React, { useState } from 'react'

import { ModalWindow } from '@databyss-org/ui/primitives'
import { SourceLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'

import EditSourceForm from '../../components/SourcesContent/EditSourceForm'

const SourceModal = ({ refId, visible, onUpdate, id }) => {
  const { setSource } = useSourceContext()
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()

  const isDismissable = () => values && values.text.textValue.length

  const onDismiss = () => {
    if (isDismissable()) {
      // updates in source provider
      setSource(values)
    }
    // hide modal in navProvider
    hideModal()
    // update to editor provider
    onUpdate(values)
  }

  return (
    <ModalWindow
      visible={visible}
      key={id}
      widthVariant="form"
      onDismiss={onDismiss}
      title="Edit Source"
      dismissChild="done"
      canDismiss={isDismissable()}
    >
      <SourceLoader sourceId={refId}>
        {source => {
          if (!values) {
            setValues(source)
          }
          return (
            <EditSourceForm values={values || source} onChange={setValues} />
          )
        }}
      </SourceLoader>
    </ModalWindow>
  )
}

export default SourceModal

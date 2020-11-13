import React, { useState } from 'react'

import { ModalWindow } from '@databyss-org/ui/primitives'
import { SourceLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import CitationProvider from '@databyss-org/services/citations/CitationProvider'

import EditSourceForm from '../../components/SourcesContent/EditSourceForm'
import { buildSourceDetail } from '@databyss-org/services/sources/lib'

const SourceModal = ({ refId, visible, onUpdate, id }) => {
  const { setSource } = useSourceContext()
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()

  const isDismissable = () => values?.text?.textValue?.length

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
      canDismiss={values ? isDismissable() : true}
    >
      <SourceLoader sourceId={refId}>
        {source => {
          if (!values) {
            const _source = { ...source }
            // check if detail has been provided
            if (!_source.detail) {
              _source.detail = buildSourceDetail()
            }
            setValues(_source)
          }

          return (
            <CitationProvider>
              <EditSourceForm values={values || source} onChange={setValues} />
            </CitationProvider>
          )
        }}
      </SourceLoader>
    </ModalWindow>
  )
}

export default SourceModal

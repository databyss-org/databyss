import React, { useState, useEffect } from 'react'
import { buildSourceDetail } from '@databyss-org/services/sources/lib'
import { ModalWindow } from '@databyss-org/ui/primitives'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { setSource } from '@databyss-org/services/sources'
import CitationProvider from '@databyss-org/services/citations/CitationProvider'
import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback, EditSourceForm } from '@databyss-org/ui/components'

const SourceModal = ({ refId, visible, onUpdate, id }) => {
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()
  const sourcesRes = useBlocks(BlockType.Source, {
    includeIds: [refId],
  })

  const source = sourcesRes.isSuccess && sourcesRes.data[refId]

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

  useEffect(() => {
    if (!source) {
      // still loading...
      return
    }
    console.log('SourceModal.useEffect', source)
    // check if detail has been provided
    if (!source.detail) {
      source.detail = buildSourceDetail()
    }
    setValues(source)
  }, [source])

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
      {sourcesRes.isSuccess ? (
        <CitationProvider>
          <EditSourceForm values={values || source} onChange={setValues} />
        </CitationProvider>
      ) : (
        <LoadingFallback queryObserver={sourcesRes} />
      )}
    </ModalWindow>
  )
}

export default SourceModal

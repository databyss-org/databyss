import React, { useState } from 'react'
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
  const sourceRes = useBlocks(BlockType.Source, {
    includeIds: [refId],
  })

  if (!sourceRes.isSuccess) {
    return <LoadingFallback queryObserver={sourceRes} />
  }

  const source = sourceRes?.data[refId]

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

  if (!values) {
    const _source = { ...source }
    // check if detail has been provided
    if (!_source.detail) {
      _source.detail = buildSourceDetail()
    }
    setValues(_source)
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
      <CitationProvider>
        <EditSourceForm values={values || source} onChange={setValues} />
      </CitationProvider>
    </ModalWindow>
  )
}

export default SourceModal

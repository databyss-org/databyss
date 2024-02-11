import React, { useState, useEffect, useCallback } from 'react'
import { buildSourceDetail } from '@databyss-org/services/sources/lib'
import { ModalWindow } from '@databyss-org/ui/primitives'
import { useBlocks, usePages } from '@databyss-org/data/pouchdb/hooks'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { setSource } from '@databyss-org/services/sources'
import CitationProvider from '@databyss-org/services/citations/CitationProvider'
import { LoadingFallback, EditSourceForm } from '@databyss-org/ui/components'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { useQueryClient } from '@tanstack/react-query'

const SourceModal = ({ refId, visible, onUpdate, id, untitledPlaceholder }) => {
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()
  const blockRes = useDocument(refId)
  const pagesRes = usePages()
  const queryClient = useQueryClient()

  const saveSource = useCallback(
    (values) => {
      if (!values?.text?.textValue.length) {
        values.text.textValue = untitledPlaceholder
      }
      queryClient.setQueryData([`useDocument_${refId}`], values)
      setSource(values, {
        pages: pagesRes.data,
        // blocks: blocksRes.data,
      })
    },
    [setSource]
  )

  const onDismiss = () => {
    saveSource(values)
    // hide modal in navProvider
    hideModal()
    // update to editor provider
    onUpdate(values)
  }

  const onChange = useCallback(
    (values) => {
      setValues(values)
    },
    [setValues]
  )

  useEffect(() => {
    if (!blockRes.isSuccess) {
      // still loading...
      return
    }
    const _values = { ...blockRes.data }
    // check if detail has been provided
    if (!_values.detail) {
      _values.detail = buildSourceDetail()
    }

    setValues(_values)
  }, [blockRes.isSuccess])

  if (values?.text.textValue === untitledPlaceholder) {
    values.text.textValue = ''
  }

  return (
    <CitationProvider>
      <ModalWindow
        visible={visible}
        key={id}
        widthVariant="form"
        onDismiss={onDismiss}
        title="Edit Source"
        dismissChild="done"
        canDismiss
      >
        {blockRes.isSuccess && values ? (
          <EditSourceForm values={values} onChange={onChange} />
        ) : (
          <LoadingFallback queryObserver={blockRes} />
        )}
      </ModalWindow>
    </CitationProvider>
  )
}

SourceModal.defaultProps = {
  untitledPlaceholder: 'untitled',
}

export default SourceModal

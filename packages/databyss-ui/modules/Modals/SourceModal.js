import React, { useState, useEffect, useCallback } from 'react'
import { buildSourceDetail } from '@databyss-org/services/sources/lib'
import { ModalWindow } from '@databyss-org/ui/primitives'
import { useBlocks, usePages } from '@databyss-org/data/pouchdb/hooks'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { setSource } from '@databyss-org/services/sources'
import CitationProvider from '@databyss-org/services/citations/CitationProvider'
import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback, EditSourceForm } from '@databyss-org/ui/components'

const SourceModal = ({ refId, visible, onUpdate, id, untitledPlaceholder }) => {
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()
  const blocksRes = useBlocks(BlockType._ANY)
  const pagesRes = usePages()

  const source = blocksRes.isSuccess && blocksRes.data[refId]

  const saveSource = useCallback(
    (values) => {
      if (!values?.text?.textValue.length) {
        values.text.textValue = untitledPlaceholder
      }
      setSource(values, {
        pages: pagesRes.data,
        blocks: blocksRes.data,
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
    if (!source) {
      // still loading...
      return
    }
    // check if detail has been provided
    if (!source.detail) {
      source.detail = buildSourceDetail()
    }

    setValues(source)
  }, [source])

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
        {blocksRes.isSuccess && values ? (
          <EditSourceForm values={values} onChange={onChange} />
        ) : (
          <LoadingFallback queryObserver={blocksRes} />
        )}
      </ModalWindow>
    </CitationProvider>
  )
}

SourceModal.defaultProps = {
  untitledPlaceholder: 'untitled',
}

export default SourceModal

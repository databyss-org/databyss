/* eslint-disable no-plusplus */
import React, { useState, useCallback } from 'react'
import { uid } from '@databyss-org/data/lib/uid'
import { BlockType, Source } from '@databyss-org/services/interfaces'
import { useEditorContext } from '@databyss-org/editor/state/EditorProvider'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
import { fileIsPDF, processPDF } from '@databyss-org/services/pdf'
import { useNavigationContext } from '../../components/Navigation/NavigationProvider'
import { FileDropZone } from './FileDropZone'
import { setSource } from '@databyss-org/data/pouchdb/sources'
import { formatSource } from '@databyss-org/services/sources/lib'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

// component
export const DropZoneManager = () => {
  const embedFile = useEditorPageContext((c) => c.embedFile)
  const editorContext = useEditorContext()
  const { showModal } = useNavigationContext()
  const [isParsing, setParsing] = useState(false)

  const toDatabyssBlocks = (entryBlock, annotations) => {
    // create response object with source as first item
    const response = [entryBlock]

    // loop through annotations
    const offset = 0
    const charsBeforePageNumber = 3
    const marks = ['location']
    annotations.forEach((a) => {
      const { page, sourceText, contents } = a
      const length = page.toString().length + charsBeforePageNumber

      // source text
      if (sourceText) {
        response.push({
          _id: uid(),
          type: BlockType.Entry,
          text: {
            textValue: `p. ${page} ${sourceText}`,
            ranges: [{ offset, length, marks }],
          },
        })
      }

      // annotation contents
      if (contents) {
        response.push({
          _id: uid(),
          type: BlockType.Entry,
          text: {
            textValue: `p. ${page} [${contents}]`,
            ranges: [{ offset, length, marks }],
          },
        })
      }
    })

    return response
  }

  // modal methods
  const showAlert = (heading: string, message: string, error?: Error) => {
    showModal({
      component: 'INFO',
      props: {
        heading,
        message,
      },
    })

    if (error && process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }

  const showMetadataModal = async (source: Source) =>
    new Promise((resolve, reject) => {
      try {
        showModal({
          component: 'METADATA',
          props: {
            source,
            dismissCallback: (response) => {
              resolve(response)
            },
          },
        })
      } catch (error) {
        reject(error)
      }
    })

  // content methods
  const insert = (blocks) => {
    try {
      editorContext.insert(blocks)
    } catch (error) {
      showAlert(
        '⚠️ An error occured',
        'Unable to insert annotations. Please try again later, or try with another document.',
        error as Error
      )
    }
  }

  const processImage = async (file: File) => {
    try {
      const block = await embedFile(file)
      editorContext.insert([block])
    } catch (error) {
      showAlert(
        '⚠️ An error occured',
        'Unable to upload file. Please try again later, or try with a different file.',
        error as Error
      )
    }
  }

  const onFileDrop = useCallback(
    async (file: File) => {
      // show spinner
      setParsing(true)

      if (fileIsPDF(file)) {
        try {
          const _processResults = await processPDF(file)
          await setSource(_processResults.source)
          const _source = _processResults.catalogQueryResults 
            ? formatSource(await showMetadataModal(_processResults.source))
            : _processResults.source
          const _blocks = toDatabyssBlocks(_source, _processResults.annotations)
          insert(_blocks)
        } catch (error) {
          console.error(error)
          showAlert(
            '⚠️ An error occured',
            'Unable to obtain annotations from this document. Please try again later, or try with another document.',
            error as Error
          )
        }
      } else {
        await processImage(file)
      }

      setParsing(false)
    },
    [processPDF, processImage]
  )

  return React.useMemo(
    () => <FileDropZone onFile={onFileDrop} isBusy={isParsing} />,
    [isParsing]
  )
}

/* eslint-disable no-plusplus */
import React, { useState, useCallback } from 'react'
import { uid } from '@databyss-org/data/lib/uid'
import {
  Block,
  BlockType,
  Embed,
  Source,
  Text,
} from '@databyss-org/services/interfaces'
import { makeText } from '@databyss-org/services/blocks'
import { useEditorContext } from '@databyss-org/editor/state/EditorProvider'
import { setSource } from '@databyss-org/services/sources'
import { formatSource } from '@databyss-org/editor/components/Suggest/SuggestSources'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
import {
  fetchAnnotations,
  fileIsPDF,
  queryMetadataFromCatalog,
} from '@databyss-org/services/pdf'
import { useNavigationContext } from '../../components/Navigation/NavigationProvider'
import { FileDropZone } from './FileDropZone'
import { buildSourceDetail } from '@databyss-org/services/sources/lib'
import { uploadEmbed } from '@databyss-org/services/embeds'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

// component
export const DropZoneManager = () => {
  const embedFile = useEditorPageContext((c) => c.embedFile)
  const editorContext = useEditorContext()
  const { showModal } = useNavigationContext()
  const [isParsing, setParsing] = useState(false)

  // utils
  /* eslint-disable no-prototype-builtins */
  const hasEnoughMetadata = (data) =>
    data.hasOwnProperty('author') || data.hasOwnProperty('title')
  /* eslint-enable no-prototype-builtins */

  const buildSourceBlock = (data: Source | string, embed: Embed) => {
    const block: Source = {
      ...(typeof data === 'string'
        ? { detail: buildSourceDetail(), text: makeText(data) }
        : data),
      type: BlockType.Source,
      _id: uid(),
      media: [embed._id],
    }
    console.log('[DropZoneManager] source', block)
    setSource(block)
    return block
  }

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

  const processPDF = async (file: File) => {
    try {
      let entryBlock
      // parse pdf annotations and metadata
      // const response = await fetchAnnotations(file)
      // get extended metadata from catalog service
      let _source: Source | null = null
      const _embed: Embed = await uploadEmbed(file, file.name)
      const response = await eapi.pdf.parse(_embed.detail?.src)
      // console.log('[DropZoneManager] PDF parse results', response)
      const _title = response.metadata?.title?.text ?? file.name
      if (hasEnoughMetadata(response.metadata)) {
        _source = await queryMetadataFromCatalog(response.metadata)
      }
      if (_source) {
        _source = formatSource(await showMetadataModal(_source))
        entryBlock = buildSourceBlock(_source!, _embed)
      } else {
        console.warn(
          'Not enough PDF metadata to attempt to get additional info from Crossref.'
        )
        entryBlock = buildSourceBlock(_title, _embed)
      }

      const blocks = toDatabyssBlocks(entryBlock, response.annotations)
      insert(blocks)
    } catch (error) {
      console.error(error)
      showAlert(
        '⚠️ An error occured',
        'Unable to obtain annotations from this document. Please try again later, or try with another document.',
        error as Error
      )
    }
  }

  const onFileDrop = useCallback(
    async (file: File) => {
      // show spinner
      setParsing(true)

      if (fileIsPDF(file)) {
        await processPDF(file)
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

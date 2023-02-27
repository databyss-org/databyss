/* eslint-disable no-plusplus */

import React, { useState, useEffect } from 'react'
import { uid } from '@databyss-org/data/lib/uid'
import { BlockType } from '@databyss-org/services/interfaces'
import { makeText } from '@databyss-org/services/blocks'
import { useEditorContext } from '@databyss-org/editor/state/EditorProvider'
import { setSource } from '@databyss-org/services/sources'
import * as services from '@databyss-org/services/pdf'
import { formatSource } from '@databyss-org/editor/components/Suggest/SuggestSources'
import { useNavigationContext } from '../../components/Navigation/NavigationProvider'
import { View } from '../../primitives'
import InfoModal from '../../modules/Modals/InfoModal'

import DashedArea from './DashedArea'

// constants
const ACCEPTABLE_KINDS = ['file']
const ACCEPTABLE_TYPES = ['application/pdf']
const MAX_FILE_SIZE = 7500000 // 7.5 mb // TODO: use env var for this

// styled components
const viewStyles = () => ({
  position: 'absolute',
  bottom: '4%',
  height: '100%',
  left: '50%',
  marginLeft: '-48%',
  overflow: 'hidden',
  width: '96%',
  css: {
    pointerEvents: 'none',
  },
})

// methods
const isAcceptableFile = (item) =>
  ACCEPTABLE_KINDS.includes(item.kind) && ACCEPTABLE_TYPES.includes(item.type)

/* eslint-disable no-prototype-builtins */
const hasEnoughMetadata = (data) =>
  data.hasOwnProperty('author') || data.hasOwnProperty('title')
/* eslint-enable no-prototype-builtins */

const humanReadableFileSize = (bytes) => {
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

  const exponent = Math.floor(Math.log(bytes) / Math.log(1000))
  /* eslint-disable no-restricted-properties */
  const significand = (bytes / Math.pow(1000, exponent)).toFixed(1)
  /* eslint-enable no-restricted-properties */

  // non breakable space is necessary
  /* eslint-disable no-irregular-whitespace */
  return `${significand} ${units[exponent]}B`
  /* eslint-enable no-irregular-whitespace */
}

const getFileToProcess = (event) => {
  const filesToProcess = []

  if (event.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    const numItems = event.dataTransfer.items.length
    for (let i = 0; i < numItems; i++) {
      const item = event.dataTransfer.items[i]
      if (isAcceptableFile(item)) {
        filesToProcess.push(item.getAsFile())
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    const numItems = event.dataTransfer.files.length
    for (let i = 0; i < numItems; i++) {
      const item = event.dataTransfer.files[i]
      if (isAcceptableFile(item)) {
        filesToProcess.push(item)
      }
    }
  }

  if (filesToProcess.length === 0) {
    return null
  }

  const file = filesToProcess[0]

  // TODO: handle multiple files at once?
  if (filesToProcess.length > 1) {
    console.warn(
      `Multiple files are not handled at this time. ` +
        `"${file.name}" will be parsed.`
    )
  }

  return file
}

const findMatchesInCrossref = (crossref, metadata) => {
  const { title } = metadata.fromPDF
  const matches = []
  crossref.message.items.forEach((element) => {
    if (element.title && Array.isArray(element.title)) {
      const elementTitle = element.title[0]
      if (elementTitle === title.src || elementTitle === title.text) {
        matches.push(element)
      }
    }
  })
  return matches
}

// component
const PDFDropZoneManager = () => {
  const editorContext = useEditorContext()

  const { showModal } = useNavigationContext()

  const [isDropAreaVisible, setDropAreaVisibility] = useState(false)

  const [isParsing, setParsing] = useState(false)
  const [hasParsed, setParsed] = useState(false)

  // utils
  const buildEntryBlock = (data) => {
    let response = { _id: uid() }

    if (typeof data === 'string') {
      // filename only
      response.type = BlockType.Entry
      response.text = makeText(`@${data}`)
    } else {
      // complete metadata
      response.type = BlockType.Source
      response = Object.assign(response, data)
      setSource(response)
    }

    return response
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
  const showAlert = (heading, message, error) => {
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

  const showMetadataModal = async (metadata) =>
    new Promise((resolve, reject) => {
      try {
        showModal({
          component: 'METADATA',
          props: {
            metadata,
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
        error
      )
    }
  }

  // drag handlers
  const onDragOver = (event) => {
    event.stopPropagation()
    event.preventDefault()
    setDropAreaVisibility(true)
  }

  const onDragLeave = (event) => {
    event.stopPropagation()
    event.preventDefault()
    setDropAreaVisibility(false)
  }

  const onFileDrop = async (event) => {
    // prevent default behavior
    // (prevent file from being opened)
    event.stopPropagation()
    event.preventDefault()

    setParsed(false)

    const file = getFileToProcess(event)

    if (!file) {
      setDropAreaVisibility(false)
      showAlert(
        '⚠️ Unable to import file',
        'We are only able to import PDF files at this time. Please ensure to use a PDF document.'
      )
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setDropAreaVisibility(false)
      showAlert(
        '⚠️ Unable to import file',
        `The size of "${file.name}" ` +
          `(${humanReadableFileSize(file.size)}) ` +
          `exceeds the maximum file size currently allowed ` +
          `(${humanReadableFileSize(MAX_FILE_SIZE)}). ` +
          `Reduce the file size, or choose another document.`
      )
      return
    }

    try {
      // show spinner
      setParsing(true)

      // parse pdf annotations
      const response = await services.fetchAnnotations(file)

      const metadata = {
        fromPDF: response.metadata,
        fromCrossref: null,
      }

      if (hasEnoughMetadata(metadata.fromPDF)) {
        // get additional metadata from crossref
        const crossref = await services.fetchMetadata(metadata.fromPDF)

        // find in crossref the item(s) that match the title in metadata.fromPDF
        const matches = findMatchesInCrossref(crossref, metadata)

        // select first match
        if (matches.length > 0) {
          metadata.fromCrossref = matches[0]
          if (matches.length > 1) {
            // TODO: show modal to select if more than one match?
            console.warn(
              'More than one item provided by Crossref matched the PDF. Using first one found.'
            )
          }
        }
      } else {
        console.warn(
          'Not enough PDF metadata to attempt to get additional info from Crossref.'
        )
      }

      let entryBlock
      if (metadata.fromCrossref) {
        const detailedMetadata = formatSource(await showMetadataModal(metadata))
        entryBlock = buildEntryBlock(detailedMetadata)
      } else {
        entryBlock = buildEntryBlock(file.name)
      }

      const blocks = toDatabyssBlocks(entryBlock, response.annotations)
      insert(blocks)
    } catch (error) {
      showAlert(
        '⚠️ An error occured',
        'Unable to obtain annotations from this document. Please try again later, or try with another document.',
        error
      )
    } finally {
      setParsing(false)
      setParsed(true)
      setDropAreaVisibility(false)
    }
  }

  // init/cleanup methods
  const addDragEventHandlers = () => {
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onFileDrop)
  }

  const removeDragEventHandlers = () => {
    window.removeEventListener('dragover', onDragOver)
    window.removeEventListener('dragleave', onDragLeave)
    window.removeEventListener('drop', onFileDrop)
  }

  useEffect(() => {
    // init
    addDragEventHandlers()

    return () => {
      // cleanup
      removeDragEventHandlers()
    }
  }, [])

  // render methods
  const label = hasParsed ? '' : 'Drop your PDF here'

  return React.useMemo(
    () => (
      <View {...viewStyles()} className="pdf-drop-zone-manager">
        <DashedArea
          label={label}
          isVisible={isDropAreaVisible}
          isParsing={isParsing}
        />
        <InfoModal id="pdfDropZoneModal" />
      </View>
    ),
    [label, isDropAreaVisible, isParsing]
  )
}

export default PDFDropZoneManager

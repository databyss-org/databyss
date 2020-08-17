/* eslint-disable no-plusplus */

import React, { useState, useEffect } from 'react'

import ObjectId from 'bson-objectid'

import { BlockType } from '@databyss-org/services/interfaces'
import { useEditorContext } from '@databyss-org/editor/state/EditorProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import * as services from '@databyss-org/services/pdf'

import { useNavigationContext } from '../../components/Navigation/NavigationProvider'
import { View } from '../../primitives'
import InfoModal from '../../modules/Modals/InfoModal'
import styled from '../../primitives/styled'

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
  pointerEvents: 'none',
  width: '96%',
})

const StyledView = styled(View, viewStyles)

// methods
const buildSourceDetail = data => {
  // NOTE: cannot prefer const, as we may assign props dynamically
  /* eslint-disable prefer-const */
  let response = {}
  if (data.authors) {
    response.authors = []
    data.authors.forEach(authorData => {
      let author = {}
      if (authorData.firstName) {
        author.firstName = { textValue: authorData.firstName }
      }
      if (authorData.lastName) {
        author.lastName = { textValue: authorData.lastName }
      }
      response.authors.push(author)
    });
  }
  if (data.year) {
    response.year = { textValue: data.year }
  }
  if (data.doi) {
    response.doi = { textValue: data.doi }
  }
  if (data.issn) {
    response.issn = { textValue: data.issn }
  }
  return response
  /* eslint-enable prefer-const */
}

const buildEntryText = data => {
  let text = ''

  // add author(s)
  const firstAuthor = data.authors[0]
  text += `${firstAuthor.lastName}, `
  text += `${firstAuthor.firstName.substr(0, 1)}.`
  if (data.authors.length > 1) {
    text += ' et al.'
  }
  text += ', '

  // get title index before adding other content
  const titleStartIndex = text.length

  // add title
  text += `${data.title}`

  // add year
  if (data.year) {
    text += ` (${data.year})`
  }

  return {
    textValue: `${text}`,
    ranges: [
      {
        offset: titleStartIndex,
        length: data.title.length,
        marks: ['italic'],
      },
    ],
  }
}

const isAcceptableFile = item =>
  ACCEPTABLE_KINDS.includes(item.kind) && ACCEPTABLE_TYPES.includes(item.type)

/* eslint-disable no-prototype-builtins */
const hasEnoughMetadata = data =>
  data.hasOwnProperty('author') || data.hasOwnProperty('title')
/* eslint-enable no-prototype-builtins */

const humanReadableFileSize = bytes => {
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

const getFileToProcess = event => {
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
  crossref.message.items.forEach(element => {
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
  const setSource = useSourceContext(c => c && c.setSource)

  const { showModal } = useNavigationContext()

  const [isDropAreaVisible, setDropAreaVisibility] = useState(false)

  const [isParsing, setParsing] = useState(false)
  const [hasParsed, setParsed] = useState(false)

  // utils
  const buildEntryBlock = data => {
    const response = { _id: new ObjectId().toHexString() }

    if (typeof data === 'string') {
      // filename only
      response.type = BlockType.Entry
      response.text = { textValue: `@${data}`, ranges: [] }
    } else {
      // complete metadata
      response.type = BlockType.Source
      response.text = buildEntryText(data)
      response.detail = buildSourceDetail(data)

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
    annotations.forEach(a => {
      const { page, sourceText, contents } = a
      const length = page.toString().length + charsBeforePageNumber

      // source text
      if (sourceText) {
        response.push({
          _id: new ObjectId().toHexString(),
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
          _id: new ObjectId().toHexString(),
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
  const showAlert = (heading, message) => {
    showModal({
      component: 'INFO',
      props: {
        heading,
        message,
      },
    })
  }

  const showMetadataModal = async metadata =>
    new Promise((resolve, reject) => {
      try {
        showModal({
          component: 'METADATA',
          props: {
            metadata,
            dismissCallback: response => {
              resolve(response)
            },
          },
        })
      } catch (error) {
        reject(error)
      }
    })

  // content methods
  const insert = blocks => {
    try {
      editorContext.insert(blocks)
    } catch (error) {
      showAlert(
        '⚠️ An error occured',
        'Unable to insert annotations. Please try again later, or try with another document.'
      )
    }
  }

  // drag handlers
  const onDragOver = event => {
    event.stopPropagation()
    event.preventDefault()
    setDropAreaVisibility(true)
  }

  const onDragLeave = event => {
    event.stopPropagation()
    event.preventDefault()
    setDropAreaVisibility(false)
  }

  const onFileDrop = async event => {
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
        const detailedMetadata = await showMetadataModal(metadata)
        entryBlock = buildEntryBlock(detailedMetadata)
      } else {
        entryBlock = buildEntryBlock(file.name)
      }

      const blocks = toDatabyssBlocks(entryBlock, response.annotations)
      insert(blocks)
    } catch (error) {
      // TODO: log only if in dev mode
      console.log('error:', error)

      showAlert(
        '⚠️ An error occured',
        'Unable to obtain annotations from this document. Please try again later, or try with another document.'
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
  const getLabel = () => (hasParsed ? '' : 'Drop your PDF here')

  const render = () => (
    <StyledView className="pdf-drop-zone-manager">
      <DashedArea
        label={getLabel()}
        isVisible={isDropAreaVisible}
        isParsing={isParsing}
      />
      <InfoModal id="pdfDropZoneModal" />
    </StyledView>
  )

  return render()
}

export default PDFDropZoneManager

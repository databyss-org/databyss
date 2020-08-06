/* eslint-disable no-plusplus */

import React, { useState, useEffect } from 'react'

import { BlockType } from '@databyss-org/services/interfaces'
import { useEditorContext } from '@databyss-org/editor/state/EditorProvider'
import * as services from '@databyss-org/services/pdf'

import { useNavigationContext } from '../../components/Navigation/NavigationProvider'
import { View } from '../../primitives'
import InfoModal from '../../modules/Modals/InfoModal'
import styled from '../../primitives/styled'

import DashedArea from './DashedArea'

// constants
const ACCEPTABLE_KINDS = ['file']
const ACCEPTABLE_TYPES = ['application/pdf']

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
  zIndex: '10',
})

const StyledView = styled(View, viewStyles)

// methods
const isAcceptableFile = item =>
  ACCEPTABLE_KINDS.includes(item.kind) && ACCEPTABLE_TYPES.includes(item.type)

// component
const PDFDropZoneManager = () => {
  const editorContext = useEditorContext()

  const { showModal } = useNavigationContext()

  const [isDropAreaVisible, setDropAreaVisibility] = useState(false)

  const [isParsing, setParsing] = useState(false)
  const [hasParsed, setParsed] = useState(false)

  // utils
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

  const toDatabyssBlocks = (fileName, annotations) => {
    // create response object with source as first item
    const response = [
      {
        type: BlockType.Entry,
        text: { textValue: `@${fileName}`, ranges: [] },
      },
    ]

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

    try {
      setParsing(true)
      const response = await services.fetchAnnotations(file)
      const blocks = toDatabyssBlocks(file.name, response.annotations)

      try {
        editorContext.insert(blocks)
      } catch (error) {
        showAlert(
          '⚠️ An error occured',
          'Unable to insert annotations. Please try again later, or try with another document.'
        )
      }
    } catch (error) {
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

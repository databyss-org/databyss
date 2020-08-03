/* eslint-disable no-plusplus */

import React, { useState, useEffect } from 'react'

import * as services from '@databyss-org/services/pdf'

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
  height: '100%',
  overflow: 'hidden',
  width: '100%',
  zIndex: '10',
})

const StyledView = styled(View, viewStyles)

// methods
const isAcceptableFile = item =>
  ACCEPTABLE_KINDS.includes(item.kind) && ACCEPTABLE_TYPES.includes(item.type)

// component
const PDFDropZoneManager = () => {
  const [isDropAreaVisible, setDropAreaVisibility] = useState(false)

  const [isParsing, setParsing] = useState(false)
  const [hasParsed, setParsed] = useState(false)

  const [modalHeading, setModalHeading] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [isModalVisible, setModalVisibility] = useState(false)

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

  const showModal = (title, message) => {
    setModalHeading(title)
    setModalMessage(message)
    setModalVisibility(true)
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
      showModal('⚠️ Unable to parse document', 'Ensure to use a PDF document.')
      return
    }

    try {
      setParsing(true)
      const response = await services.fetchAnnotations(file)
      // TODO: parse annotations and add them to current page
      console.log('response:', response)
    } catch (error) {
      showModal(
        '⚠️ An error occured',
        'Unable to obtain annotations from this document. Please try again later, or try with another document.'
      )
    } finally {
      setParsing(false)
      setParsed(true)
      setDropAreaVisibility(false)
    }
  }

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
    addDragEventHandlers()

    return () => {
      removeDragEventHandlers()
    }
  }, [])

  const getLabel = () => (hasParsed ? '' : 'Drop your PDF here')

  const getPointerEvents = () => (isParsing ? 'all' : 'none')

  const render = () => (
    <StyledView className="pdf-drop-zone-manager">
      <DashedArea
        label={getLabel()}
        isVisible={isDropAreaVisible}
        isParsing={isParsing}
        pointerEvents={getPointerEvents()}
      />
      <InfoModal
        id="pdfDropZoneModal"
        visible={isModalVisible}
        heading={modalHeading}
        message={modalMessage}
      />
    </StyledView>
  )

  return render()
}

export default PDFDropZoneManager

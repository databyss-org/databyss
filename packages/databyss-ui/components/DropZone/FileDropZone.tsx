/* eslint-disable no-plusplus */
import React, { useState, useEffect, useRef } from 'react'
import { SUPPORTED_IMAGE_TYPES } from '@databyss-org/editor/state/EditorProvider'
import { useNavigationContext } from '../../components/Navigation/NavigationProvider'
import { View } from '../../primitives'
import DashedArea from './DashedArea'

// constants
const ACCEPTABLE_KINDS = ['file']
const PDF_TYPES = ['application/pdf']

export function containsFiles(event: DragEvent) {
  if (event.dataTransfer?.types) {
    for (let i = 0; i < event.dataTransfer.types.length; i++) {
      if (event.dataTransfer.types[i] === 'Files') {
        return true
      }
    }
  }
  return false
}

// methods
const isAcceptableFile = (item: DataTransferItem | File) =>
  (item instanceof File || ACCEPTABLE_KINDS.includes(item.kind)) &&
  (PDF_TYPES.includes(item.type) || SUPPORTED_IMAGE_TYPES.includes(item.type))

const getFileToProcess = (event: InputEvent | DragEvent) => {
  const filesToProcess: File[] = []

  if (event.dataTransfer?.items) {
    // Use DataTransferItemList interface to access the file(s)
    const numItems = event.dataTransfer.items.length
    for (let i = 0; i < numItems; i++) {
      const item = event.dataTransfer.items[i]
      if (isAcceptableFile(item)) {
        filesToProcess.push(item.getAsFile()!)
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    const numItems = event.dataTransfer?.files.length ?? 0
    for (let i = 0; i < numItems; i++) {
      const item = event.dataTransfer!.files[i]
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

// component
export const FileDropZone = ({
  onFile,
  isBusy,
}: {
  onFile: (file: File) => void
  isBusy?: boolean
}) => {
  const { showModal } = useNavigationContext()
  const viewRef = useRef<HTMLElement | null>(null)

  const [isDropAreaVisible, setDropAreaVisibility] = useState(false)
  const [hasParsed, setParsed] = useState(false)

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

  // drag handlers
  const onDragOver = (event: DragEvent) => {
    if (!containsFiles(event)) {
      return
    }
    // console.log('[FileDropzone] dragOver', event)
    event.stopPropagation()
    event.preventDefault()
    // editorContext.setDragActive(true)
    setDropAreaVisibility(true)
  }

  const onDragLeave = (event) => {
    if (!containsFiles(event)) {
      return
    }
    event.stopPropagation()
    event.preventDefault()
    // editorContext.setDragActive(false)
    setDropAreaVisibility(false)
  }

  const onFileDrop = async (event: DragEvent) => {
    if (!containsFiles(event)) {
      return
    }
    // prevent default behavior
    // (prevent file from being opened)
    event.stopPropagation()
    event.preventDefault()
    // editorContext.setDragActive(false)

    setParsed(false)

    const file = getFileToProcess(event)

    if (!file) {
      setDropAreaVisibility(false)
      showAlert(
        '⚠️ Unable to import file',
        'We are only able to import PDF and image files (JPG, GIF, PNG) at this time.'
      )
      return
    }

    onFile(file)

    setParsed(true)
    setDropAreaVisibility(false)
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
    addDragEventHandlers()

    return () => {
      removeDragEventHandlers()
    }
  }, [])

  // render methods
  const label = hasParsed ? '' : 'Drop your file here'

  return React.useMemo(
    () => (
      <View
        ref={viewRef}
        className="pdf-drop-zone-manager"
        position="absolute"
        bottom="0"
        top="0"
        left="0"
        right="0"
        height="100%"
        width="100%"
        overflow="hidden"
        css={{ pointerEvents: 'none' }}
      >
        <DashedArea
          label={label}
          isVisible={isDropAreaVisible || isBusy}
          isParsing={isBusy}
        />
      </View>
    ),
    [label, isDropAreaVisible, isBusy, viewRef]
  )
}

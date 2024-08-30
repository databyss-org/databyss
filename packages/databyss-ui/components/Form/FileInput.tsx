import React, { useCallback } from 'react'
import { Button, ButtonProps } from '../..'

export interface FileInputProps extends ButtonProps {
  onChange?: (value: FileList | null) => void
  buttonVariant?: string
  label?: string
  accept?: string
}
export const FileInput = ({
  onChange,
  buttonVariant = 'secondaryUi',
  label = 'Open…',
  accept,
  ...others
}: FileInputProps) => {
  const showFileDialog = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    if (accept) {
      input.accept = accept
    }
    input.onchange = (e: any) => {
      if (!onChange) {
        return
      }
      onChange(e.target.files)
    }
    input.click()
  }, [onChange])

  return (
    <Button variant={buttonVariant} {...others} onPress={showFileDialog}>
      {label}
    </Button>
  )
}

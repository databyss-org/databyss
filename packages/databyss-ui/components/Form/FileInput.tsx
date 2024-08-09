import React, { useCallback } from 'react'
import { Button, ButtonProps } from '../..'

export interface FileInputProps extends ButtonProps {
  onChange?: (value: FileList | null) => void
  buttonVariant?: string
  label?: string
}
export const FileInput = ({
  onChange,
  buttonVariant = 'secondaryUi',
  label = 'Open…',
  ...others
}: FileInputProps) => {
  const showFileDialog = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
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

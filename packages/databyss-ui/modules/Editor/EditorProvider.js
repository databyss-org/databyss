import React, { useContext } from 'react'
import { ServiceContext } from '@databyss-org/services/components/ServiceProvider'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import EditorBlock from './EditorBlock'

const EditorProvider = () => {
  const serviceContext = useContext(ServiceContext)
  const { app } = serviceContext
  app.checkService()
  return (
    <View borderVariant="thinLight" paddingVariant="small" height={150}>
      <EditorBlock />
    </View>
  )
}

export default EditorProvider

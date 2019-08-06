import React, { useContext } from 'react'
import { ServiceContext } from '@databyss-org/services/components/ServiceProvider'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'

const EditorBlock = () => {
  const serviceContext = useContext(ServiceContext)
  const { app } = serviceContext
  app.checkService()
  return (
    <Grid mb="small">
      <View borderVariant="thinLight" paddingVariant="small">
        <Text variant="uiTextNormal">Editor Symbol</Text>
      </View>
      <View borderVariant="thinLight" paddingVariant="small">
        <Text variant="uiTextNormal">Editor Editor</Text>
      </View>
    </Grid>
  )
}

export default EditorBlock

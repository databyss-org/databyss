import React, { useContext } from 'react'
import { ServiceContext } from '@databyss-org/services/components/ServiceProvider'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import EditorBlock from './EditorBlock'
import EditorMenu from './EditorMenu'

const EditorProvider = () => {
  const serviceContext = useContext(ServiceContext)
  const { app } = serviceContext
  app.checkService()

  const symbol = '@'
  const text =
    'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company 1997. Crossref, doi:10.1075/aicr.12. '
  const pageSymbol = '//'
  const pageText = 'p 288-90'
  const entrySymbol = ''
  const entryText = 'On the limitation of third-order thought to assertion'

  const menuItems = [{ text: 'x' }, { text: '@' }, { text: '//' }]
  const menuAction = { text: '+' }

  return (
    <View borderVariant="thinLight" paddingVariant="small">
      <EditorBlock symbol={symbol} text={text} />
      <EditorBlock symbol={pageSymbol} text={pageText} />
      <EditorBlock symbol={entrySymbol} text={entryText} />
      <EditorMenu menuItems={menuItems} menuAction={menuAction} />
    </View>
  )
}

export default EditorProvider

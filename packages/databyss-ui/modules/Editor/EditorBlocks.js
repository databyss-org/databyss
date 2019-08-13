import React, { useEffect } from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { useProviderContext } from '@databyss-org/services/editor/EditorProvider'
import TextArea from './TextArea'
import MenuItem from './MenuItem'
import { styleSelector } from './_helpers'

const EditorBlocks = ({}) => {
  const [state, actions] = useProviderContext()
  const { blocks, editRef, editIndex } = state
  const { setRef, setEditRef } = actions

  const pasteListener = e => {
    e.preventDefault()
    const text = (e.originalEvent || e).clipboardData.getData('text/plain')
    // insert text manually
    document.execCommand('insertHTML', false, text)
  }

  useEffect(
    () => {
      if (editRef instanceof Element) {
        editRef.addEventListener('paste', pasteListener)
        return () => {
          editRef.removeEventListener('paste', pasteListener)
        }
      }
    },
    [editRef]
  )
  let blocksRender = blocks.map((i, k) => {
    const menuAction =
      i.index === editIndex && i.rawText.length === 0 ? '+' : null
    return (
      <Grid columnGap={1} mb={3} width={1} key={k}>
        <View width={1 / 12}>
          {menuAction && <MenuItem text={menuAction} />}
        </View>
        <View width={9 / 12}>
          <Text
            variant={styleSelector(i.type).style}
            color={styleSelector(i.type).color}
          >
            <TextArea
              activeIndex={editIndex}
              editRef={setEditRef}
              blockState={i}
              actions={actions}
              setRef={setRef}
            />
          </Text>
        </View>
      </Grid>
    )
  })

  return <View>{blocksRender}</View>
}

export default EditorBlocks

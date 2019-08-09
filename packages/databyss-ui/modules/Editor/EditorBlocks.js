import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { useStateValue } from '@databyss-org/services/editor/ServiceProvider'
import TextArea from './TextArea'
import ActiveBlock from './ActiveBlock'
import { menuAction, styleSelector } from './_helpers'

const EditorBlocks = ({ data }) => {
  const [{ blocks }, dispatch] = useStateValue()

  const setRef = ref => {
    dispatch({ type: 'SET_REF', data: ref.current })
  }

  let blocksRender = blocks.map((i, k) => {
    return (
      <Grid columnGap={1} mb={3} width={1}>
        <View width={1 / 12} />
        <View width={9 / 12}>
          <Text variant={styleSelector(i.type)}>
            <TextArea
              blockState={i}
              dispatch={dispatch}
              setRef={setRef}
              key={k}
            />
          </Text>
        </View>
      </Grid>
    )
  })

  blocksRender = blocksRender.concat(
    <ActiveBlock symbol={'*'} key={data.length} />
  )

  return <View>{blocksRender}</View>
}

export default EditorBlocks

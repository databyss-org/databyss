import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import EditorMenu from './EditorMenu/EditorMenu'
import space from '@databyss-org/ui/theming/space'

const TextBlock = ({ children, variant, color }) => (
  <Text variant={variant} color={color}>
    {children}
  </Text>
)

const textSelector = ({ children, type }) => {
  const textStyle = type =>
    ({
      SOURCE: { variant: 'bodyNormalUnderline', color: 'text.0' },
      LOCATION: {
        variant: 'bodyNormalDashedUnderline',
        color: 'text.0',
      },
      TOPIC: {
        variant: 'bodyNormalSemibold',
        color: 'text.0',
      },
      TAG: { variant: 'BodySmall', color: 'grey' },
      ENTRY: { variant: 'bodyNormal', color: 'text.0' },
    }[type])
  return TextBlock({ children, ...textStyle(type) })
}

const EditorBlock = ({ children, node }) => (
  <Grid mb="medium" flexWrap="nowrap" columnGap="small">
    <View
      contentEditable="false"
      suppressContentEditableWarning
      css={{ userSelect: 'none' }}
      width={1 / 10}
      overflow="visible"
      paddingLeft={space.small}
    >
      <View position="absolute" width={1}>
        {node.text.length < 1 && <EditorMenu node={node} />}
      </View>
    </View>
    <View flexShrink={1} overflow="visible">
      {textSelector({ children, type: node.type })}
    </View>
  </Grid>
)

export default EditorBlock

import { KeyUtils, Value, Block } from 'slate'
import { serializeNodeToHtml, sanitizer } from './inlineSerializer'
import ObjectId from 'bson-objectid'
import { stateToSlate, getRangesFromBlock } from './markup'
import { findActiveBlock, isAtomicInlineType } from './reducer'
import { getRawHtmlForBlock, entities } from '../state/reducer'
import { RawHtml, View } from '@databyss-org/ui/primitives'

KeyUtils.setGenerator(() => ObjectId().toHexString())

export const toSlateJson = (editorState, pageBlocks) => ({
  document: {
    nodes: pageBlocks.map(block => {
      let nodes = []
      switch (block.type) {
        case 'ENTRY':
          nodes = stateToSlate(
            {
              [block.refId]: editorState.entries[block.refId],
            },
            block._id
          )
          break
        case 'LOCATION':
          nodes = stateToSlate(
            {
              [block.refId]: editorState.locations[block.refId],
            },
            block._id
          )
          nodes.type = 'LOCATION'
          break
        default:
          break
      }

      let textBlock
      if (isAtomicInlineType(block.type)) {
        const nodeWithRanges = stateToSlate({
          [block.refId]: entities(editorState, block.type)[block.refId],
        }).nodes

        const _block = Block.fromJSON({
          object: 'block',
          type: block.type,
          nodes: nodeWithRanges,
        })

        const _innerHtml = serializeNodeToHtml(_block)

        textBlock = isAtomicInlineType(block.type)
          ? {
              object: 'inline',
              nodes: [
                {
                  object: 'text',
                  text: sanitizer(_innerHtml),
                },
              ],
              type: block.type,
            }
          : {
              object: 'text',
              text: getRawHtmlForBlock(editorState, block),
            }
      }

      // this will return generic node
      return !isAtomicInlineType(block.type)
        ? nodes
        : {
            object: 'block',
            key: block._id,
            type: block.type,
            nodes: [textBlock],
          }
    }),
  },
})

export const renderInline = ({ node, attributes }, editor, next) => {
  const isSelected = editor.value.selection.focus.isInNode(node)
  const backgroundColor = isSelected ? 'background.2' : ''

  if (isAtomicInlineType(node.type)) {
    return (
      <RawHtml
        backgroundColor={backgroundColor}
        _html={{ __html: node.text }}
        {...attributes}
      />
    )
  }

  return next()
}

export const renderMark = (props, editor, next) => {
  const { children, mark, attributes } = props
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>
    case 'italic':
      return <i {...attributes}>{children}</i>
    case 'location':
      if (editor.value.anchorBlock.type !== 'LOCATION') {
        return (
          <View
            {...attributes}
            borderBottom="1px dashed"
            borderColor="text.4"
            display="inline"
            borderRadius={0}
          >
            {children}
          </View>
        )
      }
      return next()
    default:
      return next()
  }
}

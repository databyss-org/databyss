import React from 'react'
import { KeyUtils, Block } from 'slate'
import ObjectId from 'bson-objectid'
import { RawHtml, View } from '@databyss-org/ui/primitives'
import { serializeNodeToHtml, sanitizer } from './inlineSerializer'
import { stateToSlate, getRangesFromBlock } from './markup'
import { isAtomicInlineType } from './page/reducer'
import { getRawHtmlForBlock, entities } from '../state/page/reducer'

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

// checks if the selection has the anchor before the focus
//  if it was selected with the range going forward or backwards
export const isSelectionReversed = value => {
  const { selection, fragment, document } = value
  if (
    !selection.focus.isInNode(
      document.getNode(fragment.nodes.get(fragment.nodes.size - 1).key)
    )
  ) {
    return true
  }
  return false
}

export const getBlockRanges = block => {
  const jsonBlockValue = { ...block.toJSON(), key: block.key }
  const ranges = getRangesFromBlock(jsonBlockValue).ranges
  return ranges
}

// Takes a selection and normalizes it to the document (getRootBlocksAtRange)
// checks the first and last block to see if its contained in the selection, sometimes the selection will include previous and last block despite not having text in the selection
export const getSelectedBlocks = value => {
  const { selection, fragment, document } = value
  let _fragmentNodes = fragment.nodes

  // first or last block sometimes appear as orphan keys in our data structure
  //  selection needs to be normalized
  let _nodeList = document.getRootBlocksAtRange(selection)
  // if fragment selection spans multiple block
  if (_nodeList.size > 1) {
    // reverse if needed
    if (isSelectionReversed(value)) {
      _fragmentNodes = _fragmentNodes.reverse()
      _nodeList = _nodeList.reverse()
    }

    const _lastNodeFragment = _fragmentNodes.get(_fragmentNodes.size - 1).text
    const _lastNode = _nodeList.get(_nodeList.size - 1)

    const _firstNodeFragment = _fragmentNodes.get(0).text
    const _firstNode = _nodeList.get(0)

    // if first block selection is not equal to first block
    // remove block from list
    if (_firstNode.text !== _firstNodeFragment) {
      _nodeList = _nodeList.delete(0)
    }

    // if last block selection is not equal to last block
    // remove block from list
    if (_lastNode.text !== _lastNodeFragment) {
      _nodeList = _nodeList.delete(_nodeList.size - 1)
    }

    // check if reversed
    if (isSelectionReversed(value)) {
      _nodeList = _nodeList.reverse()
    }

    return _nodeList
  }
  return _nodeList
}

// https://www.notion.so/databyss/Editor-crashes-on-backspace-edge-case-f3fd18b2ba6e4df190703a94815542ed
export const singleBlockBackspaceCheck = value => {
  const _selectedBlocks = getSelectedBlocks(value)
  if (
    _selectedBlocks.size === 1 &&
    !isAtomicInlineType(_selectedBlocks.get(0)) &&
    _selectedBlocks.get(0).text.length === 0
  ) {
    return true
  }
  return false
}

export const hasSelection = value => {
  const { selection } = value
  if (!(selection.isBlurred || selection.isCollapsed)) {
    return true
  }
  return false
}

export const noAtomicInSelection = value => {
  const _nodeList = getSelectedBlocks(value)

  const isNotAtomicInFragment =
    _nodeList.filter(block => isAtomicInlineType(block.type)).size === 0

  return isNotAtomicInFragment
}

export const isActiveSelection = value => {
  const { fragment, selection } = value

  // returns a boolean if both anchor and focus do not contain atomic block
  const isNotAtomic = noAtomicInSelection(value)

  if (
    selection.isBlurred ||
    selection.isCollapsed ||
    fragment.text === '' ||
    !isNotAtomic
  ) {
    return false
  }
  return true
}

export const isBlockEmpty = (id, editor) => {
  if (hasSelection(editor.value)) {
    return true
  }
  const _node = editor.value.document.getNode(id)

  if (_node) {
    if (
      _node.text.length === 0 &&
      editor.value.activeMarks.size === 0 &&
      _node.type === 'ENTRY'
    ) {
      return true
    }
    return false
  }
  return true
}

export const isEmptyAndAtomic = text => {
  if (
    (text.trim().match(/^@/) || text.trim().match(/^#/)) &&
    text.trim().length === 1
  ) {
    console.log('is there')
  }
}

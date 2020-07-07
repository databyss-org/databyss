import React, { useCallback } from 'react'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { useEditorContext } from './EditorProvider'
import { isAtomicInlineType } from '../lib/util'

const splitBlockAtOffset = ({ block, offset }) => {
  // const _id = isAtomicInlineType(block.type)
  //   ? block._id
  //   : new ObjectId().toHexString()

  // if first block is atomic return
  if (isAtomicInlineType(block.type) || offset === 0) {
    return { before: null, after: { text: block.text, type: block.type } }
  }

  const rangesForBlockBefore = []
  const rangesForBlockAfter = []

  block.text.ranges.forEach(r => {
    if (r.offset > offset) {
      rangesForBlockAfter.push({
        offset: r.offset - offset,
        length: r.length,
        marks: r.marks,
      })
    }
    if (r.offset < offset) {
      rangesForBlockBefore.push({
        offset: r.offset,
        length: offset - r.offset,
        marks: r.marks,
      })
      rangesForBlockAfter.push({
        offset: 0,
        length: r.length + r.offset - offset,
        marks: r.marks,
      })
    }
    if (r.offset === offset) {
      rangesForBlockAfter.push({
        offset: 0,
        length: r.length,
        marks: r.marks,
      })
    }
  })

  return {
    before: {
      text: {
        textValue: block.text.textValue.substring(0, offset),
        ranges: rangesForBlockBefore,
      },
      type: block.type,
    },
    after: {
      text: {
        textValue: block.text.textValue.substring(offset),
        ranges: rangesForBlockBefore,
      },
      type: block.type,
    },
  }
}

const isSelectionCollapsed = selection => {
  const { anchor, focus } = selection
  return anchor.index === focus.index && anchor.offset === focus.offset
}

const getId = (type, id) => {
  return isAtomicInlineType(type) ? id : new ObjectId().toHexString()
}

const getCurrentSelection = state => {
  if (isSelectionCollapsed(state.selection)) {
    return []
  }

  const frag = []

  const { blocks, selection } = state
  const { anchor, focus } = selection

  let _blocks = cloneDeep(blocks)

  // if selection is more than one block
  if (anchor.index < focus.index) {
    // first block
    const { after: firstBlock } = splitBlockAtOffset({
      block: blocks[anchor.index],
      offset: anchor.offset,
    })

    frag.push({
      ...firstBlock,
      _id: getId(firstBlock.type, blocks[anchor.index]._id),
    })

    const _sliceLength = focus.index - anchor.index

    if (_sliceLength > 1) {
      _blocks.splice(anchor.index + 1, _sliceLength - 1).forEach(b => {
        frag.push({ text: b.text, type: b.type, _id: getId(b.type, b._id) })
      })
    }

    // get in between frags

    const { before: lastBlock } = splitBlockAtOffset({
      block: blocks[focus.index],
      offset: focus.offset,
    })
    frag.push({
      ...lastBlock,
      _id: getId(lastBlock.type, blocks[focus.index]._id),
    })
  }

  return frag
}

const ClickboardListener = () => {
  const { state } = useEditorContext()
  const copyHandler = useCallback(
    e => {
      const _frag = getCurrentSelection(state)
      console.log(_frag)
    },
    [state]
  )

  useEventListener('copy', copyHandler)

  useEventListener('cut', copyHandler)

  useEventListener('paste', copyHandler)

  return null
}

export default ClickboardListener

import { isAtomicInlineType } from './util'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

// returns before and after value for block split at index `offset`
const splitBlockAtOffset = ({ block, offset }) => {
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

// checks is state selection is collapsed
export const isSelectionCollapsed = selection => {
  const { anchor, focus } = selection
  return anchor.index === focus.index && anchor.offset === focus.offset
}

// return atomic or new id
const getId = (type, id) => {
  return isAtomicInlineType(type) ? id : new ObjectId().toHexString()
}

// returns fragment in state selection
export const getCurrentSelection = state => {
  if (isSelectionCollapsed(state.selection)) {
    return []
  }

  let frag = []

  const { blocks, selection } = state
  // TODO: always put anchor before focus
  const { anchor, focus } = selection

  let _blocks = cloneDeep(blocks)

  // if selection is within the same block
  if (anchor.index === focus.index) {
    const _selectionLength = focus.offset - anchor.offset
    const _block = blocks[anchor.index]
    // split block at anchor offset and use `after`
    let _firstSplit = splitBlockAtOffset({
      block: _block,
      offset: anchor.offset,
    }).after

    // split block at length of selection and get `before`
    const _secondSplit = splitBlockAtOffset({
      block: _firstSplit,
      offset: _selectionLength,
    }).before

    // if selection is use the first split
    const _frag = _secondSplit ? _secondSplit : _firstSplit
    frag.push({ ..._frag, _id: getId(_frag.type, blocks[anchor.index]._id) })
  }

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
    if (lastBlock) {
      frag.push({
        ...lastBlock,
        _id: getId(lastBlock.type, blocks[focus.index]._id),
      })
    }
  }
  // add metadata
  frag = frag.map(b => ({ ...b, __showNewBlockMenu: false, __isActive: false }))

  return frag
}

const mergeBlocks = ({ firstBlock, secondBlock }) => {
  const mergedTextValue = firstBlock.text.textValue + secondBlock.text.textValue

  const mergedRanges = [
    ...firstBlock.text.ranges,
    ...secondBlock.text.ranges.map(r => ({
      ...r,
      offset: r.offset + firstBlock.text.textValue.length,
    })),
  ]

  const mergedBlock = {
    text: {
      textValue: mergedTextValue,
      ranges: mergedRanges,
    },
  }

  return mergedBlock
}

export const insertBlockAtIndex = ({ block, blockToInsert, index }) => {
  const splitBlock = splitBlockAtOffset({ block, offset: index })
  let mergedBlock = mergeBlocks({
    firstBlock: splitBlock.before,
    secondBlock: blockToInsert,
  })
  mergedBlock = mergeBlocks({
    firstBlock: mergedBlock,
    secondBlock: splitBlock.after,
  })

  return mergedBlock
}

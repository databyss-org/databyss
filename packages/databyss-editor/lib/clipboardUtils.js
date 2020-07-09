import { isAtomicInlineType } from './util'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

// returns before and after value for block split at index `offset`
const splitBlockAtOffset = ({ block, offset }) => {
  // if first block is atomic return
  if (isAtomicInlineType(block.type) || offset === 0) {
    return { before: null, after: { text: block.text, type: block.type } }
  }

  if (offset === block.text.textValue.length) {
    return { before: { text: block.text, type: block.type }, after: null }
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
        ranges: rangesForBlockAfter,
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

  const { anchor, focus } = selection
  let _anchor = anchor
  let _focus = focus

  // always put anchor before focus
  if (anchor.index > focus.index) {
    _focus = [_anchor, (_anchor = _focus)][0]
  } else if (anchor.offset > focus.offset && anchor.index === focus.index) {
    _focus = [_anchor, (_anchor = _focus)][0]
  }

  let _blocks = cloneDeep(blocks)

  // if selection is within the same block
  if (_anchor.index === _focus.index) {
    const _selectionLength = _focus.offset - _anchor.offset
    const _block = blocks[_anchor.index]
    // split block at anchor offset and use `after`
    let _firstSplit = splitBlockAtOffset({
      block: _block,
      offset: _anchor.offset,
    }).after

    // split block at length of selection and get `before`
    const _secondSplit = splitBlockAtOffset({
      block: _firstSplit ? _firstSplit : _block,
      offset: _selectionLength,
    }).before

    // if selection is use the first split
    const _frag = _secondSplit ? _secondSplit : _firstSplit

    frag.push({ ..._frag, _id: getId(_frag.type, blocks[_anchor.index]._id) })
  }

  // if selection is more than one block
  if (_anchor.index < _focus.index) {
    // first block
    const { after: firstBlock } = splitBlockAtOffset({
      block: blocks[_anchor.index],
      offset: _anchor.offset,
    })

    if (firstBlock) {
      frag.push({
        ...firstBlock,
        _id: getId(firstBlock.type, blocks[_anchor.index]._id),
      })
    }

    const _sliceLength = _focus.index - _anchor.index

    if (_sliceLength > 1) {
      _blocks.splice(_anchor.index + 1, _sliceLength - 1).forEach(b => {
        frag.push({ text: b.text, type: b.type, _id: getId(b.type, b._id) })
      })
    }

    // get in between frags
    const { before: lastBlock } = splitBlockAtOffset({
      block: blocks[_focus.index],
      offset: _focus.offset,
    })

    if (lastBlock) {
      frag.push({
        ...lastBlock,
        _id: getId(lastBlock.type, blocks[_focus.index]._id),
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
  ].filter(r => r.length > 0)

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

  let mergedBlock
  if (splitBlock.before) {
    mergedBlock = mergeBlocks({
      firstBlock: splitBlock.before,
      secondBlock: blockToInsert,
    })
  }

  if (splitBlock.after) {
    mergedBlock = mergeBlocks({
      firstBlock: mergedBlock ? mergedBlock : blockToInsert,
      secondBlock: splitBlock.after,
    })
  }
  return mergedBlock
}

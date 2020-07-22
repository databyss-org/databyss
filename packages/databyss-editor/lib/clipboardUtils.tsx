import ObjectId from 'bson-objectid'
// import { BlockType } from '@databyss-org/services/interfaces'
import {
  // Text,
  // Range,
  Selection,
  EditorState,
  // Block
} from '../interfaces'
import { isAtomicInlineType } from './util'
import { stateToHTMLString } from './slateUtils'

export interface Range {
  offset: number
  length: number
  marks: Array<string>
}

export interface Text {
  textValue: string
  ranges: Array<Range>
}

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
}

export interface Block {
  _id: string
  type: BlockType
  text: Text
}

interface BasicBlock {
  type: BlockType
  text: Text
}

interface SplitText {
  before: Text | null
  after: Text | null
}

// returns before and after value for text split at `offset`
const splitTextAtOffset = ({
  text,
  offset,
}: {
  text: Text
  offset: number
}): SplitText => {
  // if offset is at start of text, return text value
  if (offset === 0) {
    return { before: null, after: text }
  }

  if (offset === text.textValue.length) {
    return { before: text, after: null }
  }

  let rangesForBlockBefore: Range[] = []
  let rangesForBlockAfter: Range[] = []

  text.ranges.forEach((r: Range) => {
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

  rangesForBlockBefore = rangesForBlockBefore.filter(r => r.length > 0)

  rangesForBlockAfter = rangesForBlockAfter.filter(r => r.length > 0)

  return {
    before: {
      textValue: text.textValue.substring(0, offset),
      ranges: rangesForBlockBefore,
    },

    after: {
      textValue: text.textValue.substring(offset),
      ranges: rangesForBlockAfter,
    },
  }
}

// checks is state selection is collapsed
export const isSelectionCollapsed = (selection: Selection): boolean => {
  const { anchor, focus } = selection
  return anchor.index === focus.index && anchor.offset === focus.offset
}

// return atomic or new id
const fragmentId = (type: BlockType, id: string): string =>
  isAtomicInlineType(type) ? id : new ObjectId().toHexString()

// takes blocks array and resets the id's for non atomic types
export const resetIds = (fragment: Block[]): Block[] =>
  fragment.map(block => ({ ...block, _id: fragmentId(block.type, block._id) }))

const addBlockUIFields = (frag: Block[]): Block[] =>
  frag.map(b => ({ ...b, __showNewBlockMenu: false, __isActive: false }))

// always have the anchor come before the focus
export const sortSelection = (selection: Selection): Selection => {
  const { anchor, focus } = selection

  if (
    anchor.index > focus.index ||
    (anchor.offset > focus.offset && anchor.index === focus.index)
  ) {
    return {
      anchor: focus,
      focus: anchor,
    }
  }
  return { anchor, focus }
}

// returns fragment in state selection
export const getFragmentForCurrentSelection = (state: EditorState): Block[] => {
  if (isSelectionCollapsed(state.selection)) {
    return []
  }

  let frag: Block[] = []

  const { blocks, selection } = state

  const { anchor, focus } = sortSelection(selection)

  // if selection is within the same block
  if (anchor.index === focus.index) {
    const _selectionLength = focus.offset - anchor.offset
    const _block = blocks[anchor.index]
    // split block at anchor offset and use `after`
    const _firstTextSplit = isAtomicInlineType(_block.type)
      ? _block.text
      : splitTextAtOffset({
          text: _block.text,
          offset: anchor.offset,
        }).after

    // split block at length of selection and get `before`
    const _secondTextSplit = isAtomicInlineType(_block.type)
      ? _block.text
      : splitTextAtOffset({
          text: _firstTextSplit || _block.text,
          offset: _selectionLength,
        }).before

    // if text frag has no `second split` use the first split (whole block was selected)
    const _textFrag = _secondTextSplit || _firstTextSplit

    if (_textFrag) {
      frag.push({
        text: _textFrag,
        type: _block.type,
        _id: fragmentId(_block.type, _block._id),
      })
    }
  }

  // if selection is more than one block
  if (anchor.index < focus.index) {
    blocks.forEach((block: Block, index: number) => {
      // first block
      if (index === anchor.index) {
        const { after: firstTextFrag } = isAtomicInlineType(block.type)
          ? { after: block.text }
          : splitTextAtOffset({
              text: block.text,
              offset: anchor.offset,
            })

        if (firstTextFrag) {
          frag.push({
            text: firstTextFrag,
            type: block.type,
            _id: fragmentId(block.type, block._id),
          })
        }
      }
      // get in between frags
      else if (index > anchor.index && index < focus.index) {
        const _sliceLength = focus.index - anchor.index
        if (_sliceLength > 1) {
          frag.push({
            text: block.text,
            type: block.type,
            _id: fragmentId(block.type, block._id),
          })
        }
      }

      // last block
      else if (index === focus.index) {
        const { before: lastTextFrag } = isAtomicInlineType(block.type)
          ? { before: block.text }
          : splitTextAtOffset({
              text: block.text,
              offset: focus.offset,
            })

        if (lastTextFrag) {
          frag.push({
            text: lastTextFrag,
            type: block.type,
            _id: fragmentId(block.type, block._id),
          })
        }
      }
    })
  }
  // add metadata
  frag = addBlockUIFields(frag)

  return frag
}

const mergeText = ({ a, b }: { a: Text; b: Text }): Text => {
  const mergedTextValue = a.textValue + b.textValue

  const mergedRanges = [
    ...a.ranges,
    ...b.ranges.map((r: Range) => ({
      ...r,
      offset: r.offset + a.textValue.length,
    })),
  ].filter(r => r.length > 0)

  const mergedText = {
    textValue: mergedTextValue,
    ranges: mergedRanges,
  }

  return mergedText
}

export const insertText = ({
  block,
  text,
  index,
}: {
  block: Block
  text: Text
  index: number
}): { text: Text; type: BlockType } => {
  const splitText = splitTextAtOffset({
    text: block.text,
    offset: index,
  })

  let mergedBlock

  if (splitText.before) {
    mergedBlock = {
      text: mergeText({
        a: splitText.before,
        b: text,
      }),
      type: BlockType.Entry,
    }
  }

  if (splitText.after) {
    mergedBlock = {
      text: mergeText({
        a: mergedBlock ? mergedBlock.text : text,
        b: splitText.after,
      }),
      type: BlockType.Entry,
    }
  }

  return (
    mergedBlock || {
      type: BlockType.Entry,
      text: { textValue: '', ranges: [] },
    }
  )
}

export const deleteBlocksAtSelection = ({
  draftState,
}: {
  draftState: EditorState
}) => {
  if (isSelectionCollapsed(draftState.selection)) {
    return
  }

  const { selection, blocks } = draftState
  const { anchor, focus } = sortSelection(selection)

  // replace selection in draft
  // set selection
  const _offset = anchor.offset
  const _index = anchor.index
  const _selection = {
    _id: draftState.selection._id,
    anchor: { offset: _offset, index: _index },
    focus: { offset: _offset, index: _index },
  }

  console.log('INDEX', _selection)

  draftState.selection = _selection

  // TODO: create operation for this mutation

  draftState.operations.reloadAll = true

  // check if selection is within a block
  if (focus.index === anchor.index) {
    // delete selection and merge block fragments
    let _newBlock
    const _currentBlock = blocks[anchor.index]
    // if selection spans over entire block, delete block contents
    if (focus.offset - anchor.offset === _currentBlock.text.textValue.length) {
      _newBlock = { text: { textValue: '', ranges: [] } }
    } else {
      // split block at anchor offset
      const _splitText = splitTextAtOffset({
        text: _currentBlock.text,
        offset: anchor.offset,
      })

      //  check block for atomic
      const { before, after } = isAtomicInlineType(_currentBlock.type)
        ? {
            // reset block
            before: {
              text: { textValue: '', ranges: [] },
              type: 'ENTRY',
              _id: new ObjectId().toHexString(),
            },
            after: null,
          }
        : {
            before: { text: _splitText.before, type: 'ENTRY' },
            after: { text: _splitText.after, type: 'ENTRY' },
          }

      let lastBlockFragment
      // if `after` exists, split `after` at focus offset - before block length
      if (after) {
        let { after: _lastTextFragment } = splitTextAtOffset({
          text: after.text || { textValue: '', ranges: [] },
          offset: focus.offset - anchor.offset,
        })
        lastBlockFragment = { text: _lastTextFragment, type: BlockType.Entry }
      }

      // take that result and merge it with `before` if `before` exists
      if (before && lastBlockFragment) {
        _newBlock = {
          text: mergeText({
            a: before.text || { textValue: '', ranges: [] },
            b: lastBlockFragment.text || { textValue: '', ranges: [] },
          }),
          type: 'ENTRY',
        }
      } else if (before) {
        _newBlock = before
      } else if (lastBlockFragment) {
        _newBlock = lastBlockFragment
      }
    }

    // replace block
    draftState.blocks[anchor.index] = {
      ...draftState.blocks[anchor.index],
      ..._newBlock,
    }
  } else {
    // if selection spans over multiple blocks
    const emptyBlock = { text: { textValue: '', ranges: [] } }

    // split focus and anchor block
    let _anchorBlock = blocks[anchor.index]
    let _focusBlock = blocks[focus.index]

    const splitAnchorText = splitTextAtOffset({
      text: _anchorBlock.text,
      offset: anchor.offset,
    })

    /*
    if anchor block is atomic, remove entire block and reset id
    */
    const _splitAnchorBlock = isAtomicInlineType(_anchorBlock.type)
      ? {
          before: {
            ...emptyBlock,
            type: 'ENTRY',
            _id: new ObjectId().toHexString(),
          },
          after: null,
        }
      : {
          before: splitAnchorText.before
            ? {
                text: splitAnchorText.before,
                type: BlockType.Entry,
              }
            : null,
          after: splitAnchorText.after
            ? {
                text: splitAnchorText.after,
                type: BlockType.Entry,
              }
            : null,
        }

    _anchorBlock = _splitAnchorBlock.before
      ? { ..._anchorBlock, ..._splitAnchorBlock.before }
      : {
          ..._anchorBlock,
          ...emptyBlock,
        }

    /*
    if focus block is atomic, remove entire block and reset id
    */
    const _splitFocusText = splitTextAtOffset({
      text: _focusBlock.text,
      offset: focus.offset,
    })

    _focusBlock = isAtomicInlineType(_focusBlock.type)
      ? {
          ...emptyBlock,
          type: 'ENTRY',
          _id: new ObjectId().toHexString(),
        }
      : _splitFocusText.after
        ? { ..._focusBlock, text: _splitFocusText.after }
        : {
            ..._focusBlock,
            ...emptyBlock,
          }

    // replace blocks in the draftState
    draftState.blocks[focus.index] = _focusBlock

    const numberOfBlocksToRemove = focus.index - anchor.index - 1

    // remove all the the blocks in between the selection
    draftState.blocks.splice(anchor.index + 1, numberOfBlocksToRemove)

    draftState.blocks[anchor.index] = _anchorBlock
  }
}

export const databyssFragToPlainText = (fragment: Block[]): string => {
  return fragment.reduce(
    (acc, curr) => acc + (acc.length ? '\n' : '') + curr.text.textValue,
    ''
  )
}

export const plainTextToDatabyssFrag = (text: string): Block[] => {
  const _frag = text.split('\n').map(f => ({
    text: { textValue: f, ranges: [] },
    type: BlockType.Entry,
    _id: new ObjectId().toHexString(),
  }))
  return addBlockUIFields(_frag)
}

export const databyssFragToHtmlString = (frag: Block[]): string => {
  return stateToHTMLString(frag)
}

export const cutOrCopyEventHandler = (
  e: ClipboardEvent,
  fragment: Block[]
): void => {
  // set plain text
  e.clipboardData.setData('text/plain', databyssFragToPlainText(fragment))

  // set application data for clipboard
  e.clipboardData.setData(
    'application/x-databyss-frag',
    JSON.stringify(fragment)
  )

  // SET HTML
  e.clipboardData.setData('text/html', databyssFragToHtmlString(fragment))
}

export const pasteEventHandler = (e: ClipboardEvent): Block[] | null => {
  // databyss paste fragment
  const databyssDataTransfer = e.clipboardData.getData(
    'application/x-databyss-frag'
  )

  if (databyssDataTransfer) {
    let data = JSON.parse(databyssDataTransfer)
    data = resetIds(data)
    return data
  }

  // plaintext text fragment
  const plainTextDataTransfer = e.clipboardData.getData('text/plain')

  if (plainTextDataTransfer) {
    const data = plainTextToDatabyssFrag(plainTextDataTransfer)
    return data
  }

  // TODO: HTML paste fragment

  return null
}

import { BlockType, Page } from '@databyss-org/services/interfaces'
import { Patch } from 'immer'
import ObjectId from 'bson-objectid'
import { Selection, Block, Range, EditorState } from '../interfaces'
import { OnChangeArgs } from './EditorProvider'
import { isAtomicInlineType } from '../lib/util'
import { splitTextAtOffset } from '../lib/clipboardUtils'

export const symbolToAtomicClosureType = (symbol: string): BlockType => {
  const _type: { [key: string]: BlockType } = {
    '/@': BlockType.EndSource,
    '/#': BlockType.EndTopic,
  }
  const _closureType = _type[symbol]
  return _closureType
}

export const getClosureType = (type: BlockType): BlockType => {
  const _textSelector: { [key: string]: BlockType } = {
    END_SOURCE: BlockType.Source,
    END_TOPIC: BlockType.Topic,
  }
  const _text: BlockType = _textSelector[type]

  return _text
}

/*
if current index is a closing atomic text, return text which tag is closing
*/
export const getOpenAtomicText = (state: EditorState): string => {
  if (!state) {
    return ''
  }
  const _index = state.selection.anchor.index

  // trim blocks to remove content after anchor
  const _blocks = [...state.blocks].reverse()
  _blocks.splice(0, _blocks.length - 1 - _index)
  const _openAtomicText = ''

  const getOpenText = (
    blocks: Block[],
    openType?: BlockType,
    _ignoreType: string[] = []
  ): string => {
    if (!blocks.length) {
      return _openAtomicText
    }
    const _block = blocks.shift()
    if (_block) {
      const _openType = getClosureType(
        symbolToAtomicClosureType(_block.text.textValue)
      )
      // if current block is a closing block
      if (_openType) {
        //  _ignoreType.push(_closureType)
        return getOpenText(blocks, _openType, _ignoreType)
      }

      if (isAtomicInlineType(_block.type)) {
        //  check if type is closure type
        const _closureType = getClosureType(_block.type)
        // current atomic block is a closing block ignore that block type
        if (_closureType) {
          _ignoreType.push(_closureType)
          return getOpenText(blocks, openType, _ignoreType)
        }

        // return current block to close if its not ignored and is in currently open
        if (
          _ignoreType.findIndex((t) => t === _block.type) < 0 &&
          openType === _block.type
        ) {
          return _block.text.textValue
        }
      }
    }
    return getOpenText(blocks, openType, _ignoreType)
  }
  return getOpenText(_blocks)
}

/*
returns a list of all open atomics, use this to check if a closure is needed in current selection
*/
export const getOpenAtomics = (state: EditorState): Block[] => {
  if (!state) {
    return []
  }

  const _index = state.selection.anchor.index

  // trim blocks to remove content after anchor
  const _blocks = [...state.blocks].reverse()
  _blocks.splice(0, _blocks.length - 1 - _index)

  const findPath = (
    blocks: Block[],
    _currentAtomics: Block[] = [],
    _ignoreType: string[] = []
  ): Block[] => {
    if (!blocks.length || _currentAtomics.length === 2) {
      return _currentAtomics
    }
    const _block = blocks.shift()

    if (_block) {
      if (isAtomicInlineType(_block.type)) {
        //  check if type is closure type
        const _closureType = getClosureType(_block.type)
        // current atomic block is a closing block ignore that block type
        if (_closureType) {
          _ignoreType.push(_closureType)
          return findPath(blocks, _currentAtomics, _ignoreType)
        }

        // ignore any types that have been closed
        if (_ignoreType.findIndex((b) => b === _block.type) > -1) {
          return findPath(blocks, _currentAtomics, _ignoreType)
        }
        // if atomic type is not found in our current atomics array and is not closed, push to array
        const _idx = _currentAtomics.findIndex((b) => b.type === _block.type)
        if (_idx < 0) {
          _currentAtomics.push(_block)
        }
      }
    }

    return findPath(blocks, _currentAtomics, _ignoreType)
  }
  const _currentAtomics = findPath(_blocks)
  return _currentAtomics
}

export const atomicClosureText = (type: string, text: string): string => {
  const _textSelector: { [key: string]: string } = {
    [BlockType.EndSource]: `/@ ${text}`,
    [BlockType.EndTopic]: `/# ${text}`,
  }
  const _text: string = _textSelector[type]

  return _text
}

export const getClosureText = (type: string, state: EditorState): string => {
  const _closureText = getOpenAtomicText(state)

  return atomicClosureText(type, _closureText)
}

export const getClosureTypeFromOpeningType = (type: BlockType): BlockType => {
  const _selector: { [key: string]: BlockType } = {
    [BlockType.Source]: BlockType.EndSource,
    [BlockType.Topic]: BlockType.EndTopic,
  }
  const _type: BlockType = _selector[type]

  return _type
}

export const symbolToAtomicType = (symbol: string): BlockType => {
  const getSymbolObj: { [key: string]: BlockType } = {
    '@': BlockType.Source,
    '#': BlockType.Topic,
  }

  const blockType: BlockType = getSymbolObj[symbol]

  return blockType
}

// returns false if selection anchor and focus are equal, otherwise true
export const selectionHasRange = (selection: Selection): boolean =>
  selection &&
  (selection.anchor.index !== selection.focus.index ||
    selection.anchor.offset !== selection.focus.offset)

// shifts the range left `offset`
export const offsetRanges = (ranges: Array<Range>, _offset: number) =>
  ranges.map((r) => {
    let length = r.length
    let offset = r.offset
    // if offset is position zero, shift length instead of offset
    if (!offset) {
      length -= 1
    } else {
      offset -= _offset
    }
    return { ...r, length, offset }
  })

export const removeLocationMark = (ranges: Array<Range>) =>
  ranges.filter((r) => !r.marks.includes('location'))

// returns a shallow clone of the block so immer.patch isn't confused
export const blockValue = (block: Block): Block => ({ ...block })

// remove view-only props from patch
export const cleanupPatches = (patches: Patch[]) =>
  patches?.filter(
    (p) =>
      // blacklist if operation array includes `__`
      !(
        p.path
          .map((k) => typeof k === 'string' && k.includes('__'))
          .filter(Boolean).length ||
        // blacklist if it includes sleciton or operation
        //   p.path.includes('selection') ||
        p.path.includes('operations') ||
        p.path.includes('preventDefault')
      )
  )

export const addMetaToPatches = ({ nextState, patches }: OnChangeArgs) =>
  cleanupPatches(patches)?.map((_p) => {
    // add selection
    if (_p.path[0] === 'selection') {
      _p.value = { ..._p.value, _id: nextState.selection._id }
    }
    return _p
  })

export const editorStateToPage = (state: EditorState): Page => {
  const { selection, blocks, pageHeader } = state
  const { name, _id, archive } = pageHeader!
  return { selection, blocks, name, _id, archive } as Page
}

export const pageToEditorState = (page: Page): EditorState => {
  const { _id, name, archive, ...state } = page
  return {
    pageHeader: { _id, name, archive },
    ...state,
  } as EditorState
}
// filter out any path that doesnt contain `blocks` or `selection` and does not contain `__` metadata

export const filterInversePatches = (patches: Patch[]): Patch[] => {
  const _patches = patches.filter(
    (p) =>
      (p.path[0] === 'blocks' || p.path[0] === 'selection') &&
      !p.path.find((_p) => typeof _p === 'string' && _p.search('__') !== -1)
  )
  // if only a selection patch was sent dont return any patches

  if (_patches.length === 1 && _patches[0].path[0] === 'selection') {
    return []
  }
  return _patches
}

// if the current state selection doesn't span multiple blocks, push an update
// operation for the current block
export const pushSingleBlockOperation = ({
  stateSelection,
  draft,
}: {
  stateSelection: Selection
  draft: EditorState
}) => {
  if (stateSelection.anchor.index === stateSelection.focus.index) {
    draft.operations.push({
      index: stateSelection.anchor.index,
      block: blockValue(draft.blocks[stateSelection.anchor.index]),
    })
  }
}

/**
 * remove leading line break(s)
 * @param block block to trim
 * @returns true if lines were trimmed
 */
export const trimLeft = (block: Block): Boolean => {
  if (!block) {
    return false
  }
  const _trim = block.text.textValue.match(/^\n+/)
  if (_trim) {
    block.text.textValue = block.text.textValue.substring(_trim[0].length)
    block.text.ranges = offsetRanges(block.text.ranges, _trim[0].length)
    return true
  }
  return false
}

/**
 * remove trailing line break(s)
 * @param block block to trim
 * @returns true if lines were trimmed
 */
export const trimRight = (block: Block): Boolean => {
  if (!block) {
    return false
  }
  const _trim = block.text.textValue.match(/\n+$/)
  if (_trim) {
    // cleanup ranges
    block.text.ranges = block.text.ranges.filter(
      r => r.offset <  block.text.textValue.length - _trim[0].length
    )
    block.text.textValue = block.text.textValue.substring(
      0,
      block.text.textValue.length - _trim[0].length
    )
    return true
  }
  return false
}

/**
 * remove leading and/or trailing line break(s)
 * @param draft
 * @param atIndex
 */
export const trimLinebreaks = ({ draft, atIndex }: {
  draft: EditorState,
  atIndex: number
}) => {
  const _splitBefore = draft.blocks[atIndex]
  const _splitAfter = draft.blocks[atIndex + 1]
  trimLeft(_splitAfter)
  trimRight(_splitBefore)
}

export const splitBlockAtEmptyLine = ({ draft, atIndex }: {
  draft: EditorState,
  atIndex: number
}): Boolean => {
  const _emptyLinePattern = /^\n./m
  const _block = draft.blocks[atIndex]
  const _match = _block?.text.textValue.match(_emptyLinePattern)
  if (!_match) {
    return false
  }
  const _offset = _match.index!
  const { before, after } = splitTextAtOffset({ text: _block.text, offset: _offset + 1 })
  // set current block text to first part of split
  //   but remove the last 2 character (which are newlines)
  _block.text.textValue = before.textValue.substring(0, _offset - 1)
  _block.text.ranges = before.ranges

  // make a new block to insert with second part of split
  const _blockToInsert: Block = {
    type: BlockType.Entry,
    _id: new ObjectId().toHexString(),
    text: after
  }

  // insert the block
  draft.blocks.splice(atIndex + 1, 0, _blockToInsert)

  return true
}
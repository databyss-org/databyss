import { BlockType, Page } from '@databyss-org/services/interfaces'
import { Patch } from 'immer'
import { Selection, Block, Range, EditorState } from '../interfaces'
import { OnChangeArgs } from './EditorProvider'
import { isAtomicInlineType } from '../lib/util'

export const symbolToAtomicClosureType = (symbol: string): BlockType => {
  const _type: { [key: string]: BlockType } = {
    '/@': BlockType.EndSource,
    '/#': BlockType.EndTopic,
  }
  const _closureType = _type[symbol]
  return _closureType
}

/*
if current index is a closing atomic text, return text which tag is closing
*/
const getOpenAtomicText = (state: EditorState): string => {
  if (!state) {
    return ''
  }
  const _index = state.selection.anchor.index

  // trim blocks to remove content after anchor
  const _blocks = [...state.blocks].reverse()
  _blocks.splice(0, _blocks.length - 1 - _index)
  let _openAtomicText = ''

  const getOpenText = (
    blocks: Block[],
    // _currentAtomics: Block[] = [],
    _ignoreType: string[] = []
  ): string => {
    if (!blocks.length) {
      return _openAtomicText
    }
    const _block = blocks.shift()
    if (_block) {
      let _closureType = getClosureType(
        symbolToAtomicClosureType(_block.text.textValue)
      )
      // if current block is a closing block
      if (_closureType) {
        _ignoreType.push(_closureType)
        return getOpenText(blocks, _ignoreType)
      }

      if (isAtomicInlineType(_block.type)) {
        //  check if type is closure type
        _closureType = getClosureType(_block.type)
        // current atomic block is a closing block ignore that block type
        if (_closureType) {
          return getOpenText(blocks, _ignoreType)
        }

        // return current block to close
        if (_ignoreType.findIndex(b => b === _block.type) > -1) {
          return _block.text.textValue
        }
      }
    }
    return getOpenText(blocks, _ignoreType)
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
        let _closureType = getClosureType(_block.type)
        // current atomic block is a closing block ignore that block type
        if (_closureType) {
          _ignoreType.push(_closureType)
          return findPath(blocks, _currentAtomics, _ignoreType)
        }

        // ignore any types that have been closed
        if (_ignoreType.findIndex(b => b === _block.type) > -1) {
          console.log(_block.text.textValue)
          return findPath(blocks, _currentAtomics, _ignoreType)
        }
        // if atomic type is not found in our current atomics array and is not closed, push to array
        const _idx = _currentAtomics.findIndex(b => b.type === _block.type)
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

export const getClosureText = (type: string, state: EditorState): string => {
  const _closureText = getOpenAtomicText(state)

  return atomicClosureText(type, _closureText)
}

export const atomicClosureText = (type: string, text: string): string => {
  const _textSelector: { [key: string]: string } = {
    END_SOURCE: `/@ ${text}`,
    END_TOPIC: `/# ${text}`,
  }
  const _text: string = _textSelector[type]

  return _text
}

export const getClosureType = (type: BlockType): BlockType => {
  const _textSelector: { [key: string]: BlockType } = {
    END_SOURCE: BlockType.Source,
    END_TOPIC: BlockType.Topic,
  }
  const _text: BlockType = _textSelector[type]

  return _text
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
  ranges.map(r => {
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
  ranges.filter(r => !r.marks.includes('location'))

// returns a shallow clone of the block so immer.patch isn't confused
export const blockValue = (block: Block): Block => ({ ...block })

// remove view-only props from patch
export const cleanupPatches = (patches: Patch[]) =>
  patches &&
  patches.filter(
    p =>
      // blacklist if operation array includes `__`
      !(
        p.path
          .map(k => typeof k === 'string' && k.includes('__'))
          .filter(Boolean).length ||
        // blacklist if it includes sleciton or operation
        //   p.path.includes('selection') ||
        p.path.includes('operations') ||
        p.path.includes('preventDefault')
      )
  )

export const addMetaToPatches = ({ nextState, patches }: OnChangeArgs) =>
  cleanupPatches(patches) &&
  cleanupPatches(patches).map(_p => {
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

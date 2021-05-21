import {
  BlockType,
  Page,
  Source,
  Topic,
  Block,
} from '@databyss-org/services/interfaces'
import { uid } from '@databyss-org/data/lib/uid'
import { Patch } from 'immer'
import { Selection, Range, EditorState, Text, Point } from '../interfaces'
import { OnChangeArgs } from './EditorProvider'
import { isAtomicInlineType } from '../lib/util'
import {
  splitTextAtOffset,
  getFragmentAtSelection,
  mergeText,
  isSelectionCollapsed,
} from '../lib/clipboardUtils'

import { getAtomicDifference } from '../lib/clipboardUtils/getAtomicsFromSelection'

import {
  RangeType,
  InlineTypes,
} from '../../databyss-services/interfaces/Range'
import { IframeAttributes } from '../components/Suggest/SuggestEmbeds'

/*
takes a text object and a range type and returns the length of the range, the location of the offset and the text contained within the range, this fuction works when text block has of of that range type
*/
export const getTextOffsetWithRange = ({
  text,
  rangeType,
}: {
  text: Text
  rangeType: RangeType
}) => {
  const _string = text.textValue
  const _ranges = text.ranges.filter((r) => r.marks.includes(rangeType))
  if (_ranges.length) {
    // for now assume only one range is provided
    const _range = _ranges[0]
    const _textWithRange = _string.slice(
      _range.offset,
      _range.offset + _range.length
    )

    return {
      length: _range.length,
      offset: _range.offset,
      text: _textWithRange,
    }
  }
  return null
}

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

export const atomicTypeToInlineRangeType = (type: BlockType): InlineTypes => {
  const getSymbolObj = {
    [BlockType.Source]: InlineTypes.InlineSource,
    [BlockType.Topic]: InlineTypes.InlineTopic,
  }

  const inlineType: InlineTypes = getSymbolObj[type]

  return inlineType
}

export const atomicTypeToSymbol = (type: BlockType): string => {
  const getSymbolObj = {
    [BlockType.Source]: '@',
    [BlockType.Topic]: '#',
  }

  const symbol = getSymbolObj[type]

  return symbol
}

export const inlineTypeToSymbol = (inlineType: InlineTypes): string => {
  const getType = {
    [InlineTypes.InlineSource]: BlockType.Source,
    [InlineTypes.InlineTopic]: BlockType.Topic,
    [InlineTypes.Embed]: BlockType.Embed,
  }
  const type = getType[inlineType]

  return atomicTypeToSymbol(type)
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
  ranges.filter((r) => !r.marks.includes(RangeType.Location))

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

export const addMetaToPatches = ({
  nextState,
  previousState,
  patches,
}: OnChangeArgs) =>
  cleanupPatches(patches)?.map((_p) => {
    // add selection
    if (_p.path[0] === 'selection') {
      _p.value = { ..._p.value, _id: nextState.selection._id }
    }
    // adds _id for patch system to consume
    if (_p.path[0] === 'blocks') {
      if (_p.op === 'remove') {
        const _id = previousState.blocks[_p.path[1]]._id
        _p.value = { ..._p.value, _id }
      }
      if (_p.op === 'replace') {
        const { _id, type, text } = nextState.blocks[_p.path[1]]
        if (typeof _p.value !== 'string') {
          _p.value = { ...text, ..._p.value, _id, type }
        }
      }
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
 * @param text text to trim
 * @returns true if lines were trimmed
 */
export const trimLeft = (block: Block): Boolean => {
  const text = block?.text
  if (!text) {
    return false
  }
  const _trim = text.textValue.match(/^\n+/)
  if (_trim) {
    const _textValue = text.textValue.substring(_trim[0].length)
    const _ranges = offsetRanges(text.ranges, _trim[0].length)

    const _text = {
      textValue: _textValue,
      ranges: _ranges,
    }

    block.text = _text

    return true
  }
  return false
}

/**
 * remove trailing line break(s)
 * @param text text to trim
 * @returns true if lines were trimmed
 */
export const trimRight = (block: Block): Boolean => {
  const text = block?.text
  if (!text) {
    return false
  }
  const _trim = text.textValue.match(/\n+$/)
  if (_trim) {
    // cleanup ranges
    const _ranges = text.ranges.filter(
      (r) => r.offset < text.textValue.length - _trim[0].length
    )
    const _textValue = text.textValue.substring(
      0,
      text.textValue.length - _trim[0].length
    )
    const _text = {
      textValue: _textValue,
      ranges: _ranges,
    }
    block.text = _text

    return true
  }
  return false
}

/**
 * remove leading and/or trailing line break(s)
 * @param text text to trim
 * @returns true if lines were trimmed
 */
export const trim = (block: Block) => trimLeft(block) || trimRight(block)

export const splitBlockAtEmptyLine = ({
  draft,
  atIndex,
}: {
  draft: EditorState
  atIndex: number
}): Boolean => {
  const _emptyLinePattern = /^\n./m
  const _block = draft.blocks[atIndex]
  const _match = _block?.text.textValue.match(_emptyLinePattern)
  if (!_match) {
    return false
  }
  const _offset = _match.index!
  const { before, after } = splitTextAtOffset({
    text: _block.text,
    offset: _offset + 1,
  })
  // set current block text to first part of split
  //   but remove the last 2 character (which are newlines)

  const _text = {
    textValue: before.textValue.substring(0, _offset - 1),
    ranges: before.ranges,
  }
  _block.text = _text
  // _block.text.textValue = before.textValue.substring(0, _offset - 1)
  // _block.text.ranges = before.ranges

  // make a new block to insert with second part of split
  const _blockToInsert: Block = {
    type: BlockType.Entry,
    _id: uid(),
    text: after,
  }

  // insert the block
  draft.blocks.splice(atIndex + 1, 0, _blockToInsert)

  return true
}

export const getWordFromOffset = ({
  text,
  offset,
}: {
  text: string
  offset: number
}): { word: string; offset: number } | null => {
  if (!text) {
    return null
  }
  // split the text by space or new line
  const words: Array<string> = text.split(/\s+/)
  let _currentOffset = 0
  for (let i = 0; words.length > i; i += 1) {
    const _lastOffset = _currentOffset
    _currentOffset += words[i].length + 1
    if (_currentOffset > offset) {
      return { word: words[i], offset: _lastOffset }
    }
  }
  return null
}

export const replaceInlineText = ({
  text,
  refId,
  newText,
  type,
}: {
  text: Text
  refId: string
  newText: Text
  type: InlineTypes
}): Text | null => {
  const _symbol = inlineTypeToSymbol(type)

  const _isEmbed = type === InlineTypes.Embed
  console.log(type)

  let _textToInsert: null | Text = null
  if (!_isEmbed) {
    _textToInsert = {
      textValue: `${_symbol}${newText.textValue}`,
      ranges: [
        {
          length: newText.textValue.length + 1,
          offset: 0,
          marks: [[type, refId]],
        },
      ],
    } as Text
  } else {
    // replace embed text
    _textToInsert = {
      textValue: `[${newText.textValue}]`,
      ranges: [
        {
          length: newText.textValue.length + 2,
          offset: 0,
          marks: [[type, refId]],
        },
      ],
    } as Text
  }

  const _rangesWithId = text.ranges.filter(
    (r) => r.marks[0][0] === type && r.marks[0][1] === refId
  )
  // offset will be updated in loop
  let _cumulativeOffset = 0
  let _textToUpdate = text
  _rangesWithId.forEach((r) => {
    const _splitText = splitTextAtOffset({
      text: _textToUpdate,
      offset: r.offset + _cumulativeOffset,
    })

    // remove text from second half of split
    const _textAfter = splitTextAtOffset({
      text: _splitText.after,
      offset: r.length,
    })

    // insert text at offset
    let _mergedText = mergeText(_splitText.before, _textToInsert!)

    // merge last half of text with new next
    _mergedText = mergeText(_mergedText, _textAfter.after)

    // update cumulative text
    _textToUpdate = _mergedText

    // update offset to current offset
    // get difference of previous atomic to new atomic to update length of the atomic
    const _diff = _textToInsert!.textValue.length - r.length
    _cumulativeOffset += _diff
  })
  if (_rangesWithId.length) {
    return _textToUpdate
  }
  return null
}

export const getRangesAtPoint = ({
  blocks,
  point,
}: {
  blocks: Block[]
  point: Point
}): Range[] => {
  const _currentBlockRanges = blocks[point.index]?.text.ranges

  if (!_currentBlockRanges) {
    return []
  }

  // find which ranges fall within current offset
  const _activeRanges = _currentBlockRanges.filter((r) => {
    const { offset, length } = r
    if (point.offset >= offset && point.offset <= offset + length) {
      return true
    }
    return false
  })
  return _activeRanges
}

export const convertInlineToAtomicBlocks = ({
  block,
  index,
  draft,
}: {
  block: Block
  index: number
  draft: EditorState
}) => {
  /*
    if flag `convertInlineToAtomic` is set, pull out text within range `inlineAtomicMenu`, look up in entityCache and set the markup with appropriate id and range
  */

  // get the markup data, function returns: offset, length, text
  const inlineMarkupData = getTextOffsetWithRange({
    text: block.text,
    rangeType: RangeType.InlineAtomicInput,
  })

  // if the only text tagged with inlineAtomicMenu is the opener, remove mark and normalize the text
  if (inlineMarkupData?.length === 1) {
    const ranges: Range[] = []
    block.text.ranges.forEach((r) => {
      if (!r.marks.includes(RangeType.InlineAtomicInput)) {
        ranges.push(r)
      }
    })

    block.text.ranges = block.text.ranges.filter(
      (r) => !r.marks.includes(RangeType.InlineAtomicInput)
    )
    // force a re-render
    draft.operations.push({
      index,
      block,
    })
    return
  }

  // same operation as above but with 'inlineEmbedInput' and checking for two characters
  const inlineEmbedData = getTextOffsetWithRange({
    text: block.text,
    rangeType: RangeType.InlineEmbedInput,
  })

  if (inlineEmbedData?.length === 2) {
    const ranges: Range[] = []
    block.text.ranges.forEach((r) => {
      if (!r.marks.includes(RangeType.InlineEmbedInput)) {
        ranges.push(r)
      }
    })

    block.text.ranges = block.text.ranges.filter(
      (r) => !r.marks.includes(RangeType.InlineEmbedInput)
    )
    // force a re-render
    draft.operations.push({
      index,
      block,
    })
    return
  }
  // check if text is inline atomic type
  const _atomicType =
    inlineMarkupData && symbolToAtomicType(inlineMarkupData?.text.charAt(0))

  if (inlineMarkupData && _atomicType) {
    const _inlineType = atomicTypeToInlineRangeType(_atomicType)

    // text value with markup
    const _atomicTextValue = inlineMarkupData?.text
    let _atomicShortTextValue = _atomicTextValue

    // new Id for inline atomic
    let _atomicId = uid()

    // check entitySuggestionCache for an atomic with the identical name
    // if there's a match and the atomic type matches, use the cached
    // block's _id and textValue (to correct casing differences
    const _suggestion =
      draft.entitySuggestionCache?.[
        inlineMarkupData.text.substring(1).toLowerCase()
      ]

    let _isSuggestion = false

    // if suggestion exists in cache, grab values
    if (_suggestion?.type === _atomicType) {
      _isSuggestion = true

      let _shortName = _suggestion.text.textValue
      const __sugestion = _suggestion as Source & Topic
      if (__sugestion?.name) {
        _shortName = __sugestion.name.textValue
      }
      const _symbol = atomicTypeToSymbol(_atomicType)
      _atomicId = _suggestion._id
      _atomicShortTextValue = `${_symbol}${_shortName}`
    }

    // get value before offset
    let _textBefore = splitTextAtOffset({
      text: block.text,
      offset: inlineMarkupData.offset,
    }).before

    // get value after markup range
    const _textAfter = splitTextAtOffset({
      text: block.text,
      offset: inlineMarkupData.offset + inlineMarkupData.length,
    }).after

    // merge first block with atomic value, add mark and id to second block
    _textBefore = mergeText(_textBefore, {
      textValue: _atomicShortTextValue,
      ranges: [
        {
          offset: 0,
          length: _atomicShortTextValue.length,
          marks: [[_inlineType, _atomicId]],
        },
      ],
    })

    // get the offset value where the cursor should be placed after operation
    const _caretOffest = _textBefore.textValue.length

    // merge second block with first block
    const _newText = mergeText(_textBefore, _textAfter)

    block.text = _newText

    // force a re-render
    draft.operations.push({
      index,
      block,
    })
    // update selection
    const _nextSelection = {
      _id: draft.selection._id,
      anchor: { index, offset: _caretOffest },
      focus: { index, offset: _caretOffest },
    }

    draft.selection = _nextSelection
    // do not allow short name suggestion to overwrite details of source

    if (!(_isSuggestion && _atomicType === BlockType.Source)) {
      const _entity = {
        type: _atomicType,
        // remove atomic symbol
        text: { textValue: _atomicTextValue.substring(1), ranges: [] },
        _id: _atomicId,
      }
      draft.newEntities.push(_entity)
    } else {
      const _entity = _suggestion
      draft.newEntities.push(_entity)
    }
  }
}

/**
 *
 *  if flag `convertInlineToAtomic` is set, pull out text within range `inlineEmbedInput`, look up in entityCache and replace text with `[title]` attributes property, save block with `EMBED` type
 */
export const convertInlineToEmbed = ({
  block,
  index,
  draft,
  attributes,
}: {
  block: Block
  index: number
  draft: EditorState
  attributes: IframeAttributes
}) => {
  const _attributes = attributes
  if (!_attributes?.title?.length) {
    _attributes.title = 'untitled'
  }

  const _newId = uid()

  const inlineEmbedData = getTextOffsetWithRange({
    text: block.text,
    rangeType: RangeType.InlineEmbedInput,
  })
  if (!inlineEmbedData) {
    return
  }
  // trim text from block and replace with `[attributes.title]`
  const splitText = splitTextAtOffset({
    text: block.text,
    offset: inlineEmbedData.offset,
  })

  const textAfter = splitTextAtOffset({
    text: splitText.after,
    offset: inlineEmbedData.length,
  }).after

  // const _offset = splitText.before.textValue.length // compensate for removing <<

  let mergedText = mergeText(splitText.before, {
    textValue: `[${attributes.title}]`,
    ranges: [
      {
        marks: [[InlineTypes.Embed, _newId]],
        length: _attributes.title.length + 2,
        offset: 0,
      },
    ],
  })

  const _caretOffest = mergedText.textValue.length

  mergedText = mergeText(mergedText, textAfter)

  block.text = mergedText

  // force a block re-render
  draft.operations.push({
    index,
    block,
    //  if no text after add a nbsp
    setCaretAfter: !textAfter.textValue.length,
  })

  // update selection
  const _nextSelection = {
    _id: draft.selection._id,
    anchor: { index, offset: _caretOffest + 1 },
    focus: { index, offset: _caretOffest + 1 },
  }

  // TODO: WHAT WILL THE SELECTION BE
  draft.selection = _nextSelection
  draft.preventDefault = true
  // if suggestion exists do not create new entity

  const _entity = {
    type: BlockType.Embed,
    // remove atomic symbol
    text: { textValue: _attributes.title, ranges: [] },
    detail: {
      title: _attributes.title,
      src: _attributes.src,
      dimensions: {
        width: _attributes.height,
        height: _attributes.width,
      },
      ...(_attributes.code && { embedCode: _attributes.code }),
      mediaType: _attributes.mediaType,
    },
    _id: _newId,
  }
  draft.newEntities.push(_entity)
}

export const getInlineOrAtomicsFromStateSelection = (
  state: EditorState
): Block[] => {
  if (isSelectionCollapsed(state.selection)) {
    return []
  }

  const _frag = getFragmentAtSelection(state)
  // check fragment for inline blocks
  const _inlines = _frag.filter(
    (b) =>
      b.text.ranges.filter(
        (r) =>
          r.marks.filter(
            (m) =>
              Array.isArray(m) &&
              m.length === 2 &&
              (m[0] === InlineTypes.InlineTopic ||
                m[0] === InlineTypes.InlineSource)
          ).length
      ).length
  )

  const _inlineMenuRange = _frag.filter(
    (b) =>
      b.text.ranges.filter(
        (r) => r.marks.filter((m) => m === 'inlineAtomicMenu').length
      ).length
  )

  const _atomics = _frag.filter((b) => isAtomicInlineType(b.type))

  const atomicsInSelection = [..._inlines, ..._inlineMenuRange, ..._atomics]

  return atomicsInSelection
}

/*
create a selection which includes the whole document
*/

export const selectAllSelection = ({
  selection,
  blocks,
}: {
  selection: Selection
  blocks: Block[]
}) => {
  const _selectionFromState = {
    _id: selection._id,
    anchor: { offset: 0, index: 0 },
    focus: {
      offset: blocks[blocks.length - 1].text.textValue.length,
      index: blocks.length,
    },
  }
  return _selectionFromState
}

export const pushAtomicChangeUpstream = ({
  state,
  draft,
}: {
  state: EditorState
  draft: EditorState
}) => {
  // check if any atomics were removed in the redo process, if so, push removed atomics upstream

  // create a selection which includes the whole document
  const _selectionFromState = selectAllSelection(state)

  const _selectionFromDraft = selectAllSelection(draft)

  // return a list of atomics which were found in the second selection and not the first, this is used to see if atomics were removed from the page

  const { atomicsRemoved, atomicsAdded } = getAtomicDifference({
    stateBefore: { ...state, selection: _selectionFromState },
    stateAfter: { ...draft, selection: _selectionFromDraft },
  })

  // if redo action removed refresh page headers
  if (atomicsRemoved.length) {
    // push removed entities upstream
    // eslint-disable-next-line prefer-spread
    draft.removedEntities.push.apply(draft.removedEntities, atomicsRemoved)
  }

  // if undo action added atomics not found in page, refresh page headers
  if (atomicsAdded.length) {
    atomicsAdded.forEach((a) => {
      draft.newEntities.push(a)
    })
  }
}

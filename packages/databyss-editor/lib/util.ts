import _ from 'lodash'
import cloneDeep from 'clone-deep'
import {
  Block,
  BlockType,
  Selection,
  IndexPageResult,
  Range,
  BlockReference,
} from '@databyss-org/services/interfaces'
import { urlSafeName, validUriRegex } from '@databyss-org/services/lib/util'
import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import {
  SearchTerm,
  stemmer,
  unorm,
} from '@databyss-org/data/couchdb-client/couchdb'
import matchAll from 'string.prototype.matchall'
import { stateBlockToHtmlHeader, stateBlockToHtml } from './slateUtils'
import { EditorState, PagePath } from '../interfaces'
import { getClosureType, getClosureTypeFromOpeningType } from '../state/util'
import {
  BlockRelationshipType,
  Source,
} from '../../databyss-services/interfaces/Block'
import {
  RangeType,
  InlineTypes,
  InlineRangeType,
} from '../../databyss-services/interfaces/Range'

export const splice = (src: any, idx: number, rem: number, str: any) =>
  src.slice(0, idx) + str + src.slice(idx + Math.abs(rem))

const getInlineAtomicFromBlock = (block: Block): Range[] => {
  const _inlineRanges = block.text.ranges.filter(
    (r) =>
      r.marks.filter(
        (m) =>
          Array.isArray(m) &&
          (m[0] === InlineTypes.InlineTopic ||
            m[0] === InlineTypes.InlineSource)
      ).length
  )
  return _inlineRanges
}

export const getInlineAtomicType = (
  type: InlineTypes | string
): BlockType | null => {
  switch (type) {
    case InlineTypes.InlineTopic:
      return BlockType.Topic
    case InlineTypes.InlineSource:
      return BlockType.Source
    case InlineTypes.Embed:
      return BlockType.Embed
    default:
      return null
  }
}

const composeBlockRelation = (
  currentBlock: Block,
  atomicBlock: BlockReference,
  pageId: string,
  relationshipType: BlockRelationshipType
): IndexPageResult => {
  const _blockRelation: IndexPageResult = {
    block: currentBlock._id,
    relatedBlock: atomicBlock._id,
    blockText: currentBlock.text,
    relationshipType,
    relatedBlockType: atomicBlock.type,
    page: pageId,
    blockIndex: 0,
  }

  return _blockRelation
}

const getInlineBlockRelations = (
  block: Block,
  pageId: string,
  index: number
) => {
  const _blockRelations: IndexPageResult[] = []

  // find if any inline topics exist on block
  const _inlineRanges = getInlineAtomicFromBlock(block)
  if (_inlineRanges.length) {
    _inlineRanges.forEach((r) => {
      if (r.marks.length && Array.isArray(r.marks[0])) {
        const _inlineRange: InlineRangeType = r.marks[0]
        const _inlineType: InlineTypes = _inlineRange[0]
        const type = getInlineAtomicType(_inlineType)
        const _id = _inlineRange[1]
        if (type) {
          const _relation = composeBlockRelation(
            block,
            { type, _id },
            pageId,
            BlockRelationshipType.INLINE
          )
          _relation.blockIndex = index
          _blockRelations.push(_relation)
        }
      }
    })
  }
  return _blockRelations
}

export const isAtomicInlineType = (type: BlockType) => {
  switch (type) {
    case BlockType.Source:
      return true
    case BlockType.Topic:
      return true
    case BlockType.EndTopic:
      return true
    case BlockType.EndSource:
      return true
    case BlockType.Embed:
      return true
    default:
      return false
  }
}

export const isAtomic = (block: Block) => isAtomicInlineType(block.type)
export const isEmpty = (block: Block) => block.text.textValue.length === 0

// returns an array of indicies covered by selection
export const getSelectedIndicies = (selection: Selection) =>
  _.range(selection.anchor.index, selection.focus.index + 1)

export const withMetaData = (state: EditorState) => ({
  ...state,
  newEntities: [],
  removedEntities: [],
  operations: [],
})

export const getBlockPrefix = (type: BlockType): string => {
  const _type: { [key: string]: string } = {
    [BlockType.Source]: '@',
    [BlockType.Topic]: '#',
  }
  const _str = _type[type]
  return _str
}

/*
takes a page state, and returns the current atomic path and block relations for current block
*/
export const getPagePath = (page: EditorState): PagePath => {
  if (!page) {
    return { path: [], blockRelations: [] }
  }

  const pageId = page.pageHeader?._id

  const _index = page.selection.anchor.index

  const _currentBlock = page.blocks[_index]
  const _blockRelations: IndexPageResult[] = []

  // trim blocks to remove content after anchor
  const _blocks = [...page.blocks].reverse()
  _blocks.splice(0, _blocks.length - 1 - _index)

  type _Block = Block & { closed?: boolean }

  const findPath = (
    blocks: _Block[],
    _currentAtomics: _Block[] = []
  ): _Block[] => {
    if (!blocks.length || _currentAtomics.length === 2) {
      return _currentAtomics
    }
    const _block = blocks.shift()
    if (_block) {
      if (isAtomicInlineType(_block.type)) {
        // if atomic type is not found in our current atomics array, push to array
        const _idx = _currentAtomics.findIndex((b) => b.type === _block.type)

        if (_idx < 0) {
          // if opening block exists in current atomics, close block and remove from current atomics
          const type = getClosureType(_block.type)
          // if not a closure block push to array
          if (!type) {
            // get block relations if current block is not atomic
            if (pageId && !isAtomicInlineType(_currentBlock.type)) {
              const _relation = composeBlockRelation(
                _currentBlock,
                _block,
                pageId,
                BlockRelationshipType.HEADING
              )

              _relation.blockIndex = _index
              // push to block relations
              _blockRelations.push(_relation)
            }

            // add to current atomic
            _currentAtomics.push(_block)
          } else if (_currentAtomics.findIndex((b) => b.type === type) < 0) {
            // if closure type and block has been closed ignore
            // else push to current atomic array

            // if closure exist, create a block placeholder
            _currentAtomics.push({ ..._block, closed: true, type })
          }
        }
      }
    }
    return findPath(blocks, _currentAtomics)
  }

  const _currentAtomics = findPath(_blocks)

  const _path: string[] = []

  _currentAtomics.reverse().forEach((_block) => {
    if (!_block.closed) {
      _path.push(
        `${getBlockPrefix(_block.type)} ${stateBlockToHtmlHeader(_block)}`
      )
    }
  })

  let _inlineRelations: IndexPageResult[] = []
  // inline block indexing
  if (pageId) {
    // returns an array of block relations
    _inlineRelations = getInlineBlockRelations(_currentBlock, pageId, _index)
  }
  if (_inlineRelations.length) {
    _blockRelations.push(..._inlineRelations)
  }

  return { path: _path, blockRelations: _blockRelations }
}
/**
 * takes blocks array and returns all current block relations array
 */
export const indexPage = ({
  pageId,
  blocks,
}: {
  pageId: string | null
  blocks: Block[]
}): IndexPageResult[] => {
  const currentAtomics: {
    [key: string]: Block | null
  } = {
    [BlockType.Source]: null,
    [BlockType.Topic]: null,
  }
  const _blockRelations: IndexPageResult[] = []

  if (pageId) {
    blocks.forEach((block, index) => {
      let _inlineRelations: IndexPageResult[] = []
      const _headingRelations: IndexPageResult[] = []

      const _closureType: BlockType = getClosureType(block.type)

      const _openerType = getClosureTypeFromOpeningType(block.type)

      if (_closureType) {
        currentAtomics[_closureType] = null
      } else if (_openerType) {
        currentAtomics[block.type] = block
      }
      // console.log('[indexPage]', block, currentAtomics)
      // if not a closure block and current block is not empty
      if (!_closureType && block.text?.textValue.length) {
        // before indexing the atomic, check if block contains any inline atomics

        // inline block indexing
        if (pageId) {
          // returns an array of block relations
          _inlineRelations = getInlineBlockRelations(block, pageId, index)
        }

        // if (_inlineRelations.length) {
        //   _inlineRelations.forEach((r) => {
        //     r.activeInlines = _inlineRelations
        //   })
        //   blockRelations.push(..._inlineRelations)
        // }

        // collect heading relations
        for (const [, value] of Object.entries(currentAtomics)) {
          if (value) {
            const _relatedBlockText = {
              [BlockType.Topic]: value.text.textValue,
              [BlockType.Source]: (value as Source).name?.textValue,
            }[value.type]
            _headingRelations.push({
              block: block._id,
              relatedBlock: value._id,
              blockText: block.text,
              relatedBlockType: value.type,
              relatedBlockText: _relatedBlockText,
              relationshipType: BlockRelationshipType.HEADING,
              page: pageId,
              blockIndex: index,
            })
          }
        }

        _blockRelations.push(
          ..._headingRelations.map((hr) => ({
            ...hr,
            activeHeadings: _headingRelations,
            activeInlines: _inlineRelations,
          }))
        )
        _blockRelations.push(
          ..._inlineRelations.map((ir) => ({
            ...ir,
            activeHeadings: _headingRelations,
            activeInlines: _inlineRelations,
          }))
        )
      }
    })
  }

  return _blockRelations
}

export const slateBlockToHtmlWithSearch = (
  block: Block,
  searchTerms: SearchTerm[]
): string => {
  const _block = cloneDeep(block)

  const _ranges = [
    ..._block.text.ranges,
    ...createHighlightRanges(_block.text.textValue, searchTerms),
  ]
  // sort array by offset
  _ranges.sort((a, b) => {
    // if offset equal, sort by length
    if (a.offset === b.offset) {
      return b.length - a.length
    }
    return a.offset > b.offset ? 1 : -1
  })

  _block.text.ranges = _ranges
  const _frag = stateBlockToHtml(_block)
  return _frag
}

/**
 * only allow some properties
 */
export const cleanupAtomicData = (data: any) => {
  const _data = data
  const _propertiesToRemove = Object.keys(data).filter(
    (i) => i.substring(0, 2) === '__'
  )
  _propertiesToRemove.forEach((i) => {
    delete _data[i]
  })
  if (_data.weight) {
    delete data.weight
  }
  return _data
}

export const createLinkRangesForUrls = (text: string) => {
  const _emailRegEx = new RegExp(
    /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\b/,
    'gi'
  )
  const _ranges: Range[] = []
  const _validUri = new RegExp(validUriRegex, 'gi')
  ;[_emailRegEx, _validUri].forEach((_regex) => {
    const _matches = [...matchAll(text, _regex)]
    _matches.forEach((e) => {
      const _parts = text.split(e[0])
      let offset = 0
      _parts.forEach((part, i) => {
        if (i !== 0) {
          const _range: Range = {
            offset: offset - e[0].length,
            length: e[0].length,
            marks: [[InlineTypes.Url, e[0]]],
          }
          // const _range2 = {
          //   anchor: { path, offset: offset - e[0].length },
          //   focus: { path, offset },
          //   url: e[0],
          // }
          // check to see if this range is already included as a range
          // NOTE: enable this if patterns might overlap
          // if (!ranges.filter((r) => Range.includes(r, _range)).length) {
          //   ranges.push(_range)
          // }
          _ranges.push(_range)
        }
        offset = offset + part.length + e[0].length
      })
    })
  })
  return _ranges
}

export function matchTermRegex(term: SearchTerm) {
  if (term.exact) {
    return new RegExp(`\\b${unorm(term.text)}\\b`, 'gi')
  }
  const srex = `\\b${term.text}[^\\b]*?\\b`
  const orex = `\\b${unorm(term.original)}[^\\b]*?\\b`
  return new RegExp(`${srex}|${orex}`, 'gi')
}

export function createHighlightRanges(text: string, searchTerms: SearchTerm[]) {
  const _ranges: Range[] = []

  // normalize diacritics
  const _normalizedText = unorm(text)

  searchTerms.forEach((term) => {
    if (!term?.text) {
      return
    }

    const _rex = matchTermRegex(term)
    const matches = _normalizedText.matchAll(_rex)

    for (const match of matches) {
      // console.log('[CRH] match', term.text, match[0])
      // has match been normalized?
      const _orig = text.substring(match.index!, match.index! + match[0].length)
      const _matchNormalized = _orig !== match[0]

      // force stem match if not normalized (non-exact only)
      if (
        !term.exact &&
        !_matchNormalized &&
        stemmer(match[0]) !== stemmer(term.original)
      ) {
        // console.log(
        //   '[CRH] skipping',
        //   match[0],
        //   stemmer(match[0]),
        //   stemmer(term.original)
        // )
        continue
      }
      _ranges.push({
        offset: match.index!,
        length: match[0].length,
        marks: [RangeType.Highlight],
      })
    }
  })
  return _ranges
}

export interface InlineAtomicDef {
  name: string
  atomicType: string
  id: string
}
export const getInlineAtomicHref = ({
  name,
  atomicType,
  id,
}: InlineAtomicDef) => {
  let _nice = ''
  if (name) {
    _nice = `/${urlSafeName(name)}`
  }
  const _groupId = getAccountFromLocation()
  const _blockPath = {
    [BlockType.Source]: 'sources',
    [BlockType.Topic]: 'topics',
  }[atomicType]
  return `/${_groupId}/${_blockPath}/${id}${_nice}`
}

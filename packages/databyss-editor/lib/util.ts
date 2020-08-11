import _ from 'lodash'
import { Block } from '@databyss-org/services/interfaces/'
import { PageHeader } from '@databyss-org/services/interfaces/Page'
import { stateBlockToHtmlHeader } from '@databyss-org/editor/lib/slateUtils.js'
import { BlockType, Selection, EditorState, Text } from '../interfaces'
import { getClosureType, getClosureTypeFromOpeningType } from '../state/util'

type _Block = Block & { closed?: boolean }

type CurrentAtomics = {
  [BlockType.Source]: Block | null
  [BlockType.Topic]: Block | null
}

export type BlockRelations = {
  blockId: string
  relatedBlockId: string
  blockText: Text
  relatedTo: {
    _id: string
    relationshipType: string
    blockType: string
    pageHeader: PageHeader
    blockIndex: number
  }
}

export type PagePath = {
  path: string[]
  blockRelations: BlockRelations[]
}

export const splice = (src, idx, rem, str) =>
  src.slice(0, idx) + str + src.slice(idx + Math.abs(rem))

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
    default:
      return false
  }
}

export const isAtomic = (block: Block) => isAtomicInlineType(block.type)
export const isEmpty = (block: Block) => block.text.textValue.length === 0

const composeBlockRelation = (
  currentBlock: Block,
  atomicBlock: Block,
  pageHeader: PageHeader
): BlockRelations => {
  const _blockRelation: BlockRelations = {
    blockId: currentBlock._id,
    relatedBlockId: atomicBlock._id,
    blockText: currentBlock.text,
    relatedTo: {
      _id: currentBlock._id,
      relationshipType: 'HEADING',
      blockType: atomicBlock.type,
      pageHeader: {
        name: pageHeader.name,
        _id: pageHeader._id,
        archive: pageHeader.archive,
      },
      // replace these properties upstream
      blockIndex: 0,
    },
  }

  return _blockRelation
}

// returns an array of indicies covered by selection
export const getSelectedIndicies = (selection: Selection) =>
  _.range(selection.anchor.index, selection.focus.index + 1)

export const withMetaData = (state: EditorState) => ({
  ...state,
  newEntities: [],
  operations: [],
})

const getBlockPrefix = (type: string): string =>
  ({
    SOURCE: '@',
    TOPIC: '#',
  }[type])

export const getPagePath = (
  page: EditorState,
  pageHeader: PageHeader | null
): PagePath => {
  if (!page) {
    return { path: [], blockRelations: [] }
  }

  const _index = page.selection.anchor.index

  const _currentBlock = page.blocks[_index]
  const _blockRelations: BlockRelations[] = []

  // trim blocks to remove content after anchor
  const _blocks = [...page.blocks].reverse()
  _blocks.splice(0, _blocks.length - 1 - _index)

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
        const _idx = _currentAtomics.findIndex(b => b.type === _block.type)

        if (_idx < 0) {
          // if opening block exists in current atomics, close block and remove from current atomics
          const type = getClosureType(_block.type)
          // if not a closure block push to array
          if (!type) {
            // get block relations if current block is not atomic
            if (pageHeader && !isAtomicInlineType(_currentBlock.type)) {
              const _relation = composeBlockRelation(
                _currentBlock,
                _block,
                pageHeader
              )
              _relation.relatedTo.blockIndex = _index
              // push to block relations
              _blockRelations.push(_relation)
            }

            // add to current atomic
            _currentAtomics.push(_block)
          } else {
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

  _currentAtomics.reverse().forEach(_block => {
    if (!_block.closed) {
      _path.push(
        `${getBlockPrefix(_block.type)} ${stateBlockToHtmlHeader(_block)}`
      )
    }
  })

  // todo: optomize this
  console.log(_blockRelations)
  return { path: _path, blockRelations: _blockRelations }
}

export const indexPage = ({
  pageHeader,
  blocks,
}: {
  pageHeader: PageHeader | null
  blocks: Block[]
}): BlockRelations[] => {
  const currentAtomics: CurrentAtomics = {
    [BlockType.Source]: null,
    [BlockType.Topic]: null,
  }
  const blockRelations: BlockRelations[] = []

  if (pageHeader) {
    blocks.forEach((block, index) => {
      const _closureType: BlockType = getClosureType(block.type)

      const _openerType = getClosureTypeFromOpeningType(block.type)

      if (_closureType) {
        currentAtomics[_closureType] = null
      } else if (_openerType) {
        currentAtomics[block.type] = block
      }
      // if current block is not empty
      else if (block.text.textValue.length) {
        for (const [, value] of Object.entries(currentAtomics)) {
          if (value) {
            blockRelations.push({
              blockId: block._id,
              relatedBlockId: value._id,
              blockText: block.text,
              relatedTo: {
                _id: block._id,
                blockType: value.type,
                relationshipType: 'HEADING',
                pageHeader: {
                  name: pageHeader.name,
                  _id: pageHeader._id,
                  archive: pageHeader.archive,
                },
                blockIndex: index,
              },
            })
          }
        }
      }
    })
  }

  return blockRelations
}

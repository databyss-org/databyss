import _ from 'lodash'
import cloneDeep from 'clone-deep'
import { Block, RangeType } from '@databyss-org/services/interfaces/'
import { stateBlockToHtmlHeader,  stateBlockToHtml } from '@databyss-org/editor/lib/slateUtils.js'
import { BlockType, Selection, EditorState, BlockRelation, PagePath, Range } from '../interfaces'
import { getClosureType, getClosureTypeFromOpeningType } from '../state/util'
import { InlineTypes, InlineRangeType } from '../../databyss-services/interfaces/Range';

export const splice = (src, idx, rem, str) =>
  src.slice(0, idx) + str + src.slice(idx + Math.abs(rem))


const getInlineAtomicFromBlock = (block: Block): Range[] => {
  const _inlineRanges = block.text.ranges.filter(r =>
    r.marks.filter(m => Array.isArray(m) && m[0] ===(InlineTypes.InlineTopic)).length
   )
   return _inlineRanges
}

const getInlineBlockRelations = (block: Block, pageId: string, index: number) => {
  const _blockRelations: BlockRelation[] = []

  // find if any inline topics exist on block
  const _inlineRanges = getInlineAtomicFromBlock(block)
  if(_inlineRanges.length){
    _inlineRanges.forEach(r=> {
      if(typeof r.marks !== 'string'){
        const _inlineRange: InlineRangeType = r.marks[0]
        const _inlineType: InlineTypes = _inlineRange[0]
        const type = getInlineAtomicType(_inlineType)
        const _id = _inlineRange[1]
        if(type){
          const _relation = composeBlockRelation(
            block,
            {type, _id},
            pageId,
            'INLINE'
          )
          _relation.blockIndex = index
          _blockRelations.push(_relation)
        }
      }
    })
  }
  return _blockRelations
}


export const getInlineAtomicType = (type: InlineTypes): BlockType | null => {
  switch(type){
    case InlineTypes.InlineTopic: 
    return BlockType.Topic
    default:
      return null
  }
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
    default:
      return false
  }
}

export const isAtomic = (block: Block) => isAtomicInlineType(block.type)
export const isEmpty = (block: Block) => block.text.textValue.length === 0

const composeBlockRelation = (
  currentBlock: Block,
  atomicBlock: Block,
  pageId: string,
  relationshipType: string
): BlockRelation => {
  const _blockRelation: BlockRelation = {
    block: currentBlock._id,
    relatedBlock: atomicBlock._id,
    blockText: currentBlock.text,
    relationshipType: relationshipType,
    relatedBlockType: atomicBlock.type,
    page: pageId,
    blockIndex: 0,
  }

  return _blockRelation
}

// returns an array of indicies covered by selection
export const getSelectedIndicies = (selection: Selection) =>
  _.range(selection.anchor.index, selection.focus.index + 1)

export const withMetaData = (state: EditorState) => ({
  ...state,
  newEntities: [],
  removedEntities:[],
  operations: [],
})

const getBlockPrefix = (type: BlockType): string =>{
  const _type: {[key:string]: string} = {
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
  const _blockRelations: BlockRelation[] = []

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
        const _idx = _currentAtomics.findIndex(b => b.type === _block.type)

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
                'HEADING'
              )

              _relation.blockIndex = _index
              // push to block relations
              _blockRelations.push(_relation)
            }

            // add to current atomic
            _currentAtomics.push(_block)
          } else {
            // if closure type and block has been closed ignore
            // else push to current atomic array
           if(_currentAtomics.findIndex((b)=> b.type=== type)<0){
            // if closure exist, create a block placeholder
            _currentAtomics.push({ ..._block, closed: true, type })
           }
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

  let _inlineRelations: BlockRelation[] = []
  // inline block indexing
  if(pageId){
    // returns an array of block relations
    _inlineRelations = getInlineBlockRelations(_currentBlock, pageId, _index)
  }
  if(_inlineRelations.length){
    _blockRelations.push(..._inlineRelations)
  }

  
  return { path: _path, blockRelations: _blockRelations }
}
/*
takes blocks array and returns all current block relations array
*/
export const indexPage = ({
  pageId,
  blocks,
}: {
  pageId: string | null
  blocks: Block[]
}): BlockRelation[] => {
  const currentAtomics: {
    [key: string]: Block | null
  } = {
    [BlockType.Source]: null,
    [BlockType.Topic]: null,
  }
  const blockRelations: BlockRelation[] = []

  if (pageId) {
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
        // before indexing the atomic, check if block contains any inline atomics
        let _inlineRelations: BlockRelation[] = []
        // inline block indexing
        if(pageId){
          // returns an array of block relations
          _inlineRelations = getInlineBlockRelations(block, pageId, index)
        }
        if(_inlineRelations.length){
          blockRelations.push(..._inlineRelations)
        }


        for (const [, value] of Object.entries(currentAtomics)) {
          if (value) {
            blockRelations.push({
              block: block._id,
              relatedBlock: value._id,
              blockText: block.text,
              relatedBlockType: value.type,
              relationshipType: 'HEADING',
              page: pageId,
              blockIndex: index,
            })
          }
        }
      }
    })
  }

  return blockRelations
}



export const slateBlockToHtmlWithSearch = (block: Block, query: string): string => {
  const _block = cloneDeep(block)

  if(query){
  // add query markup to results

  const ranges: Range[] = []


    // add search ranges to block
      // add escape characters
      /*
      BUG: if query is multiple words, and split into individual words:
      query.split(' ')

      correct ranges will be applied but the function will fail on `flattenRanges` 

      for now we can only have one range added
      */
      const _word = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string

  
      // normalize diactritics
      const parts = _block.text.textValue
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(
          new RegExp(
            `\\b${_word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}\\b`,
            'i'
          )
        )


      let offset = 0

      parts.forEach((part, i) => {
        const length = _word.length

        if (i !== 0) {
          ranges.push({
            offset: offset - _word.length,
            length,
            marks: ['highlight'],
          })
        }

        offset = offset + part.length + _word.length
      })

    const _ranges = [..._block.text.ranges, ...ranges]
    // sort array by offset
    _ranges.sort((a, b)=> {
      // if offset equal, sort by length
      if(a.offset === b.offset){
        return b.length - a.length
      }
      return (a.offset > b.offset)? 1: -1
    })

    _block.text.ranges = _ranges
  }
   const _frag = stateBlockToHtml(_block)

    return _frag
}
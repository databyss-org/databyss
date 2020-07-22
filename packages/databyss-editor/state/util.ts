import { BlockType, Page } from '@databyss-org/services/interfaces'
import { Patch } from 'immer'
import { Selection, Block, Range, EditorState } from '../interfaces'
import { OnChangeArgs } from './EditorProvider'

export const symbolToAtomicType = (symbol: string): BlockType =>
  ({ '@': BlockType.Source, '#': BlockType.Topic }[symbol])

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
  patches?.filter(
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

export const addMetaToPatches = ({
  nextState,
  patches,
}: OnChangeArgs) =>
  cleanupPatches(patches)?.map(_p => {
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
    ...state
  } as EditorState
}
      // filter out any path that doesnt contain `blocks` or `selection` and does not contain `__` metadata

export const filterInversePatches = (patches: Patch[]): Patch[]=> { 
  
  const _patches = patches.filter(
    p =>
      (p.path[0] === 'blocks' || p.path[0] === 'selection') &&
      !p.path.find(_p => typeof _p === 'string' && _p.search('__') !== -1)
  )
  // if only a selection patch was sent dont return any patches

  if (_patches.length === 1 && _patches[0].path[0] === 'selection'){
    return []
  }
  return _patches}

/*
patches must occur in specific order
remove patches must occur from reverse order
add patches must occur in chronological order
*/
export const checkPatchesOrder = (patches: Patch[]) => {
  const _patches = patches

  //patches must be in following order
  // selection is first
  // 

//   // if 'remove' check for block index in reverse order
//   const _removeBlockPatches =  patches.filter(p=>  p.path[0] === 'blocks' && (p.op === 'remove'||p.op === 'replace'))


//     // if patches contain 'blocks' and 'remove' check order to see if patches must be reversed
//     if(_removeBlockPatches.length > 1 && _removeBlockPatches.filter(p=> p.op === 'remove') ){

//       const _filteredPatches = _removeBlockPatches.filter(p=> p.path[0]==='blocks')
//      // console.log('HITTT',_filteredPatches)
//       if(   _filteredPatches[0].path[1] < _filteredPatches[_filteredPatches.length-1].path[1]){
//         console.log("reverse",JSON.parse(JSON.stringify( _patches)))
//                 return  _patches.reverse()
//       }
//      // _removeBlockPatches
    

    
//     }

  
//   const _addBlockPatches =  _patches.filter(p=> p.path[0] === 'blocks' &&( p.op === 'add' || p.op ==='replace' ) )
// // if patches cointain blocks and 'add', patches must be in chronological order
// if(_addBlockPatches.length> 1 && _addBlockPatches.filter(p=> p.op === 'add') ){

//   const _filteredPatches = _addBlockPatches.filter(p=> p.path[0]==='blocks')

//   if(_filteredPatches[0].path[1] > _filteredPatches[_filteredPatches.length-1].path[1])
//   console.log("reverse 2",JSON.parse(JSON.stringify( _patches)))

//   return  _patches.reverse()

// }

  return _patches
}

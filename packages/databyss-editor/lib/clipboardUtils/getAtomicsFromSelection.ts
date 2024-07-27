import _ from 'lodash'
import { BlockReference } from '@databyss-org/services/interfaces'
import { EditorState, Block } from '../../interfaces'
import { getFragmentAtSelection } from './'
import { getAtomicsFromFrag } from '@databyss-org/services/blocks/related'

export const getAtomicsFromSelection = ({
  state,
  includeDuplicates,
}: {
  state: EditorState
  includeDuplicates?: boolean
}) => {
  const _frag = getFragmentAtSelection(state)

  const _atomicsInSelection = getAtomicsFromFrag(_frag, includeDuplicates)
  // console.log(
  //   '[getAtomicsFromSelection] _atomicsInSelection',
  //   _atomicsInSelection
  // )
  return _atomicsInSelection
}

/*
will return the results of atomics within selection, this helper function is used to see if atomics were added or deleted from page state
*/
export const getAtomicDifference = ({
  stateBefore,
  stateAfter,
}: {
  stateBefore: EditorState
  stateAfter: EditorState
}): {
  atomicsRemoved: BlockReference[]
  atomicsAdded: Block[] | BlockReference[]
  atomicsChanged: BlockReference[]
} => {
  // returns array of atomics within selection
  const _atomicsBefore = getAtomicsFromSelection({
    state: stateBefore,
    includeDuplicates: true,
  })

  const _atomicsAfter = getAtomicsFromSelection({
    state: stateAfter,
    includeDuplicates: true,
  })

  // get added and removed elements (does not count changes in freq)
  const _listOfAtomicsToRemove: BlockReference[] = _.differenceWith(
    _atomicsBefore,
    _atomicsAfter,
    _.isEqual
  )
  const _listOFAtomicsToAdd: BlockReference[] = _.differenceWith(
    _atomicsAfter,
    _atomicsBefore,
    _.isEqual
  )

  const _listOFAtomicsChanged = _.union(
    _listOFAtomicsToAdd,
    _listOfAtomicsToRemove
  )

  // get changes in freq
  const _gBefore = _.groupBy(_atomicsBefore, (b) => b._id)
  const _gAfter = _.groupBy(_atomicsAfter, (b) => b._id)
  Object.keys(_gBefore).forEach((_id) => {
    if (_gAfter[_id] && _gAfter[_id].length !== _gBefore[_id].length) {
      _listOFAtomicsChanged.push(_gBefore[_id][0])
    }
  })

  // console.log('[getAtomicDifference]', _atomicsBefore, _atomicsAfter)
  // console.log('[getAtomicDifference]', _listOFAtomicsChanged)

  return {
    atomicsRemoved: _listOfAtomicsToRemove,
    atomicsAdded: _listOFAtomicsToAdd,
    atomicsChanged: _listOFAtomicsChanged,
  }
}

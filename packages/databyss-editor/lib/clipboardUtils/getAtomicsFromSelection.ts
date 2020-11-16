import _ from 'lodash'
import { EditorState, Block } from '../../interfaces'
import { getFragmentAtSelection } from './'
import { isAtomicInlineType } from '../util'
import { AtomicType } from '../../interfaces/EditorState'
import { BlockType } from '../../../databyss-services/interfaces/Block'

const getAtomicsFromFrag = (frag: Block[]): AtomicType[] => {
  const atomics: AtomicType[] = []
  frag.forEach(b => {
    if (!isAtomicInlineType(b.type)) {
      b.text.ranges.forEach(r => {
        if (r.marks.length) {
          r.marks
            .filter(i => Array.isArray(i) && i[0] === 'inlineTopic')
            .forEach(i => {
              if (!atomics.some(a => a._id === i[1])) {
                const _inline = { type: BlockType.Topic, _id: i[1] }
                atomics.push(_inline)
              }
            })
        }
      })
    } else if (
      !atomics.some(a => a._id === b._id) &&
      b.text.textValue.charAt(0) !== '/'
    ) {
      const _atomic = { type: b.type, _id: b._id }
      atomics.push(_atomic)
    }
  })
  return atomics
}

export const getAtomicsFromSelection = ({ state }: { state: EditorState }) => {
  const _frag = getFragmentAtSelection(state)

  const _atomicsInSelection = getAtomicsFromFrag(_frag)
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
}): { atomicsRemoved: AtomicType[]; atomicsAdded: AtomicType[] } => {
  // returns array of atomics within selection
  const _atomicsBefore = getAtomicsFromSelection({
    state: stateBefore,
  })

  const _atomicsAfter = getAtomicsFromSelection({ state: stateAfter })

  const _listOfAtomicsToRemove: AtomicType[] = _.differenceWith(
    _atomicsBefore,
    _atomicsAfter,
    _.isEqual
  )

  const _listOFAtomicsToAdd: AtomicType[] = _.differenceWith(
    _atomicsAfter,
    _atomicsBefore,
    _.isEqual
  )

  return {
    atomicsRemoved: _listOfAtomicsToRemove,
    atomicsAdded: _listOFAtomicsToAdd,
  }
}

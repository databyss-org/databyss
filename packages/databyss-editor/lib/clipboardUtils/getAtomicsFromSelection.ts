import _ from 'lodash'
import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { BlockReference, BlockType } from '@databyss-org/services/interfaces'
import { validURL } from '@databyss-org/services/lib/util'
import { EditorState, Block } from '../../interfaces'
import { getFragmentAtSelection } from './'
import { isAtomicInlineType, getInlineAtomicType } from '../util'

export const getAtomicsFromFrag = (frag: Block[]): BlockReference[] => {
  const atomics: BlockReference[] = []
  frag.forEach((b) => {
    if (!isAtomicInlineType(b.type)) {
      b.text.ranges.forEach((r) => {
        if (r.marks.length) {
          r.marks
            .filter(
              (i) =>
                Array.isArray(i) &&
                (i[0] === InlineTypes.InlineTopic ||
                  i[0] === InlineTypes.InlineSource ||
                  i[0] === InlineTypes.Link ||
                  i[0] === InlineTypes.Embed)
            )
            .forEach((i) => {
              if (!atomics.some((a) => a._id === i[1])) {
                // inline page link
                if (i[0] === InlineTypes.Link && !validURL(i[1])) {
                  atomics.push({ type: BlockType.Link, _id: i[1] })
                }
                const atomicType = getInlineAtomicType(i[0])
                if (atomicType) {
                  const _inline: BlockReference = {
                    type: atomicType,
                    _id: i[1],
                  }
                  atomics.push(_inline)
                }
              }
            })
        }
      })
    } else if (
      !atomics.some((a) => a._id === b._id) &&
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
}): {
  atomicsRemoved: BlockReference[]
  atomicsAdded: Block[] | BlockReference[]
} => {
  // returns array of atomics within selection
  const _atomicsBefore = getAtomicsFromSelection({
    state: stateBefore,
  })

  const _atomicsAfter = getAtomicsFromSelection({ state: stateAfter })

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

  return {
    atomicsRemoved: _listOfAtomicsToRemove,
    atomicsAdded: _listOFAtomicsToAdd,
  }
}

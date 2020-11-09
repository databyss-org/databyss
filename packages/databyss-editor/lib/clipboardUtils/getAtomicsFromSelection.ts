import { EditorState, Block } from '../../interfaces'
import { getFragmentAtSelection } from './'
import { isAtomicInlineType } from '../util'

interface AtomicType {
  type: string
  _id: string
}

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
                const _inline = { type: 'TOPIC', _id: i[1] }
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

export default ({ state }: { state: EditorState }) => {
  const _frag = getFragmentAtSelection(state)

  const _atomicsInSelection = getAtomicsFromFrag(_frag)
  return _atomicsInSelection
}

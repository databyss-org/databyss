import cloneDeep from 'clone-deep'
import { Editor, Value } from 'slate'
import ObjectId from 'bson-objectid'
import { isAtomicInlineType } from './page/reducer'
import Html from 'slate-html-serializer'

const MARK_TAG = {
  em: 'italic',
  strong: 'bold',
}

const rules = [
  {
    deserialize(el, next) {
      const mark = MARK_TAG[el.tagName.toLowerCase()]
      if (!mark) {
        return
      }
      return {
        object: 'mark',
        type: mark,
        nodes: next(el.childNodes),
      }
    },
  },
]

export const getRangesFromBlock = block => {
  const { nodes } = block
  let text = ''
  // if not atomic block, returns text and ranges
  if (!isAtomicInlineType(block.type)) {
    return {
      ranges: nodes
        .map((n, i) => {
          // compile full text
          text += n.text
          let range = {}
          if (n.marks.length) {
            const _nodes = cloneDeep(nodes)

            // find length of all previous nodes
            _nodes.splice(i)
            const previousTextLength = _nodes.reduce(
              (total, current) => total + current.text.length,
              0
            )
            // create range object
            range = {
              offset: previousTextLength,
              length: n.text.length,
              marks: n.marks.map(m => m.type),
            }
          }

          return range
        })
        .filter(x => x.length != null),
      text,
    }
  }
  return null
}

export const slateToState = (slate, _id) => {
  const { ranges, text } = getRangesFromBlock(slate)
  const response = {
    _id,
    text,
    ranges,
  }
  return { [slate.key]: response }
}

/*
takes a node list and deserializes them to return a list with refId, _id, text, and ranges
*/
export const blocksToState = nodes => {
  const _blocks = nodes.map(block => blockToState(block)).toJS()
  return _blocks
}

export const blockToState = block => {
  // refID is required in the block data
  // refId is used to look up ranges and text in state
  let refId = block.data ? block.data.get('refId') : null
  let _textFields
  let _block = block

  if (isAtomicInlineType(block.type)) {
    // deserializes the html text to return ranges and marks
    _block = new Html({ rules }).deserialize(block.text).anchorBlock
  } else {
    // if not atomic, generate new refId
    refId = ObjectId().toHexString()
  }
  _textFields = getRangesFromBlock(_block.toJSON())

  const text = _textFields.text
  const ranges = _textFields.ranges

  const response = {
    text,
    type: block.type,
    ranges,
    refId,
    _id: block.key,
  }
  return { [block.key]: response }
}

export const stateToSlateMarkup = state => {
  const _value = Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'ENTRY',
          nodes: [
            {
              object: 'text',
              text: '',
            },
          ],
        },
      ],
    },
  })

  const _editor = new Editor({ value: _value })
  // insert text in mock editor
  _editor.insertText(state.text).moveBackward(state.text.length)
  // select correct range and apply marks
  if (state.ranges) {
    state.ranges.forEach(n => {
      _editor.moveForward(n.offset).moveFocusForward(n.length)
      n.marks.forEach(m => {
        _editor.addMark(m)
      })
      // replace range to original position
      _editor.moveFocusBackward(n.length).moveBackward(n.offset)
    })
  }
  // translate to json
  const document = _editor.value.toJSON().document
  return document
}

export const stateToSlate = (state, id) => {
  const _id = Object.keys(state)[0]
  const _state = cloneDeep(state)
  const _stateObject = _state[_id]
  const document = stateToSlateMarkup(_stateObject)
  return { ...document.nodes[0], key: id }
}

export const lineStateToSlate = state => {
  const _state = { text: state.textValue, ranges: state.ranges }
  const document = stateToSlateMarkup(_state)
  return { ...document.nodes[0], type: 'TEXT' }
}

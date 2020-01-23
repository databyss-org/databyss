import Html from 'slate-html-serializer'
import ObjectId from 'bson-objectid'
import { isAtomicInlineType } from './page/reducer'
import { getRangesFromBlock } from './markup'
import { NewEditor } from './slateUtils'

// deserializer for atomic blocks
const MARK_TAG = {
  em: 'italic',
  strong: 'bold',
}

const rules = [
  {
    deserialize: (el, next) => {
      const mark = MARK_TAG[el.tagName.toLowerCase()]
      if (!mark) {
        return undefined
      }
      /* eslint consistent-return: "error" */
      return {
        object: 'mark',
        type: mark,
        nodes: next(el.childNodes),
      }
    },
  },
]

export const trimFragment = frag => {
  let _frag = frag
  if (_frag.nodes.size > 1) {
    // trim first node if empty
    const _firstBlock = _frag.nodes.get(0)
    if (_firstBlock.text.length === 0) {
      _frag = _frag.removeNode(_firstBlock.key)
    }
    // trim last block if empty
    const _lastBlock = _frag.nodes.get(_frag.nodes.size - 1)
    if (_lastBlock.text.length === 0) {
      _frag = _frag.removeNode(_lastBlock.key)
    }
  }
  return _frag
}

export const blockToState = block => {
  // refID is required in the block data
  // refId is used to look up ranges and text in state
  let refId = block.data ? block.data.get('refId') : null
  let _block = block

  if (isAtomicInlineType(block.type)) {
    // deserializes the html text to return ranges and marks
    _block = new Html({ rules }).deserialize(block.text).anchorBlock
  } else {
    // if not atomic, generate new refId
    refId = ObjectId().toHexString()
  }
  const _textFields = getRangesFromBlock(_block.toJSON())
  const text = _textFields.textValue
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

/*
takes a node list and deserializes them to return a list with refId, _id, text, and ranges
*/
export const blocksToState = nodes => {
  const _blocks = nodes.map(block => blockToState(block)).toJS()
  return _blocks
}

export const getFragFromText = text => {
  // create a list split by carriage returns
  let _textList = text.split(/\r?\n/)
  // remove first or last text value if empty
  _textList = _textList.filter((t, i) => {
    if (
      (i !== 0 && t.length !== 0) ||
      (!i !== _textList.length - 1 && t.length !== 0)
    ) {
      return true
    }
    return false
  })
  // creates a slate editor to compose a fragment
  const _editor = NewEditor()
  // creates list of new blocks with refId and _id

  const _blockList = _textList.map(t => {
    const _refId = ObjectId().toHexString()
    const _key = ObjectId().toHexString()
    const _block = {
      object: 'block',
      type: 'ENTRY',
      data: { refId: _refId },
      key: _key,
      nodes: [
        {
          object: 'text',
          text: t,
        },
      ],
    }
    _editor.insertBlock(_block)
    return {
      [_key]: {
        _id: _key,
        refId: _refId,
        text: t,
        type: 'ENTRY',
        ranges: [],
      },
    }
  })

  // removes first node in fragment
  // this node is empty by default
  const _frag = _editor.value.document.removeNode(
    _editor.value.document.nodes.get(0).key
  )

  return { _blockList, _frag }
}

/*
this function takes a fragment and checks to see if a full single block was pasted by comparing the paste fragment to the document
*/
export const isFragmentFullBlock = (fragment, document) => {
  if (!fragment) {
    return false
  }
  const _nodes = document.nodes
  // trim fragment first and last block for empty nodes
  const _frag = trimFragment(fragment).nodes
  if (_frag.size > 1) {
    return true
  }
  if (_frag.size === 1) {
    const _refId = _frag.get(0).data.get('refId')
    const _keyRefDict = _nodes.map(n => ({
      key: n.key,
      refId: n.data.get('refId'),
    }))
    const _keyRef = _keyRefDict.find(f => f.refId === _refId)
    const _text = document.getNode(_keyRef.key).text
    // fragment contains full block
    if (_text === _frag.get(0).text) {
      return true
    }
  }
  return false
}

/*
        looks up the refId of the fragment and replaces it with an updated value, paste blocks can become stale when copying and pasting

        this function takes a blockList, fragment, value and currentState and returns updated { blockList, fragment } 
        */

export const updateClipboardRefs = (blockList, fragment, state, value) => {
  let _blockList = blockList
  let _frag = fragment

  _blockList.forEach((b, i) => {
    const _block = b[Object.keys(b)[0]]
    if (_block.type === 'SOURCE') {
      // look up source in dictionary
      const _dictSource = state.sources[_block.refId]

      // if values exist in our current state, replace with an updated value
      if (_dictSource) {
        // Edge case: when looking up atomic block by ref but a cut has occured and refId block is empty, do not perform a lookup
        if (_dictSource.textValue.length === 0) {
          return
        }
        // replace in blockList
        _blockList[i] = {
          [_block._id]: {
            ..._block,
            text: _dictSource.textValue,
            ranges: _dictSource.ranges,
          },
        }
        // look up first instance of refID in state
        const _idList = Object.keys(state.blocks)
        const _id = _idList.find(id => {
          if (state.blocks[id].refId === _block.refId) {
            return true
          }
          return false
        })
        const _node = value.document.getNode(_id).toJSON()
        const _editor = NewEditor()
        _editor.insertFragment(_frag)
        const _nodeList = _editor.value.document.nodes.map(n => n.key)
        _editor.replaceNodeByKey(_nodeList.get(i), _node)
        _frag = _editor.value.document
        // replace in fragment
      }
    }
  })
  _blockList = blocksToState(_frag.nodes)
  return { blockList: _blockList, frag: _frag }
}

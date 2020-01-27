import Html from 'slate-html-serializer'
import ObjectId from 'bson-objectid'
import { isAtomicInlineType, inlineNode } from './page/reducer'
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
    // trim first node if empty and atomic
    const _firstBlock = _frag.nodes.get(0)
    if (_firstBlock.text.length === 0 && isAtomicInlineType(_firstBlock.type)) {
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
      data: { refId: _refId, type: 'ENTRY' },
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

//  TODO: ADD TYPE TO DATA PARAMETER ON EACH BLOCK

export const updateClipboardRefs = ({ blockList, fragment, sourceCache }) => {
  const _slateBlockList = blockList
  // TODO: UPDATE FROM SOURCE PROVIDER
  const _nextFrag = _slateBlockList.reduce((_fragAccum, _slateBlock, i) => {
    const _slateBlockData = Object.values(_slateBlock)[0]
    if (_slateBlockData.type === 'SOURCE') {
      // look up source in dictionary
      const _dictSource = sourceCache[_slateBlockData.refId]
      // if values exist in our current state, replace with an updated value
      if (!_dictSource) {
        return _fragAccum
      }
      // Edge case: when looking up atomic block by refID but a cut has occured and refId block is empty, do not perform a lookup

      if (_dictSource.text.textValue.length === 0) {
        return _fragAccum
      }

      const _inlineFields = {
        refId: _slateBlockData.refId,
        id: _slateBlockData._id,
        type: _slateBlockData.type,
        // text values from source cache
        text: _dictSource.text,
      }

      // create new atomic block with given text and range
      const _node = inlineNode(_inlineFields)

      // TODO: CREATE NEW INLINE BLOCK TYPE AND ASSIGN IT TO THE INDEX VALUE

      const _editor = NewEditor()
      _editor.insertFragment(_fragAccum)
      const _nodeList = _editor.value.document.nodes.map(n => n.key)
      _editor.replaceNodeByKey(_nodeList.get(i), _node)
      return _editor.value.document
    }
    return _fragAccum
  }, fragment)

  const _blockList = blocksToState(_nextFrag.nodes)

  return { blockList: _blockList, frag: _nextFrag }
}

export const extendSelectionForClipboard = editor => {
  let _needsUpdate = false
  if (!editor.value.selection.isCollapsed) {
    const _frag = editor.value.fragment
    const _selection = editor.value.selection
    const _anchor = _selection.isForward
      ? editor.value.selection.anchor
      : editor.value.selection.focus
    const _focus = _selection.isForward
      ? editor.value.selection.focus
      : editor.value.selection.anchor
    /* 
      if fragment is one block long check to see if full block is selected 
    */

    if (_frag.nodes.size === 1 && isAtomicInlineType(_frag.nodes.get(0).type)) {
      const _isAtStart = _anchor.isAtStartOfNode(editor.value.anchorBlock)
      if (!_isAtStart) {
        _needsUpdate = true
        if (_selection.isForward) {
          editor.moveAnchorToStartOfNode(editor.value.anchorBlock)
        } else {
          editor.moveFocusToStartOfNode(editor.value.anchorBlock)
        }
      }

      const _isAtEnd = _focus.isAtEndOfNode(editor.value.anchorBlock)

      if (!_isAtEnd) {
        _needsUpdate = true
        if (_selection.isForward) {
          editor.moveFocusToEndOfNode(editor.value.anchorBlock)
        } else {
          editor.moveAnchorToEndOfNode(editor.value.anchorBlock)
        }
      }
    } else {
      // check first and last node for atomic type
      // check if anchor or focus are at end or start of node
      // if not move focus or anchor to end or start of node
      const _firstFrag = editor.value.document.getNode([_anchor.path.get(0)])
      const _lastFrag = editor.value.document.getNode([_focus.path.get(0)])
      if (isAtomicInlineType(_firstFrag.type)) {
        const _isAtStart = _anchor.isAtStartOfNode(_firstFrag)

        if (!_isAtStart) {
          // check fragment to see if first block selected is atomic
          const _firstBlock = _frag.nodes.get(0)
          if (!_firstBlock.text.length === 0) {
            _needsUpdate = true
            if (_selection.isForward) {
              editor.moveAnchorToStartOfNode(_firstFrag)
            } else {
              editor.moveFocusToStartOfNode(_firstFrag)
            }
          }
        }
      }
      if (isAtomicInlineType(_lastFrag.type)) {
        const _isAtEnd = _focus.isAtEndOfNode(_lastFrag)
        if (!_isAtEnd) {
          // check fragment to see if atomic block is selected
          const _lastBlock = _frag.nodes.get(_frag.nodes.size - 1)
          if (!_lastBlock.text.length === 0) {
            _needsUpdate = true
            if (_selection.isForward) {
              editor.moveFocusToEndOfNode(_lastFrag)
            } else {
              editor.moveAnchorToEndOfNode(_lastFrag)
            }
          }
        }
      }
    }
  }
  return { update: _needsUpdate, editor }
}

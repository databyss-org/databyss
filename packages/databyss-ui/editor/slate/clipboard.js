import Html from 'slate-html-serializer'
import _ from 'lodash'
import { getEventTransfer } from 'slate-react'
import ObjectId from 'bson-objectid'
import { isAtomicInlineType, inlineNode } from './page/reducer'
import { getRangesFromBlock } from './markup'
import { editorInstance } from './slateUtils'

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

/*
Takes a slate text or inline node and converts the values to to text, type, ranges, refId, and id. 
If the node is an atomic type, the refId is preserved
input:
  @block  slate node

output: 
{ text: string, type: string, ranges: array, refId: string, _id: string }
*/
export const slateNodeToState = block => {
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
takes clipboard data in Slate format and builds the payload for the PASTE action
*/
export const blocksToState = nodes => {
  const _blocks = nodes.map(block => slateNodeToState(block)).toJS()
  return _blocks
}

/*

* takes a string, splits them on line breaks and converts the lines to slate block. 
* composes a slate fragment out of the slate blocks

*/
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
  const _editor = editorInstance()
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

inputs
  @blockList  array of blocks to be pasted with refID and _id
  @fragment   slate fragment
  @getCache   lookup function to get updated source value

outputs
  @blocklist  array of blocks to be pasted with refID and _id
  @fragment   slate fragment
        */

export const updateClipboardRefs = ({
  blockList,
  fragment,
  sourceCache,
  getSource,
  onDirtyAtomic,
}) => {
  const _nextFrag = blockList.reduce((_fragAccum, _slateBlock, i) => {
    const _slateBlockData = Object.values(_slateBlock)[0]
    if (_slateBlockData.type === 'SOURCE') {
      // look up source in dictionary
      // const _dictSource = sourceCache[_slateBlockData.refId]
      const _dictSource = getSource(_slateBlockData.refId)

      // Edge case: when looking up atomic block by refID but a cut has occured and refId block is empty, do not perform a lookup
      if (!_.isObject(_dictSource)) {
        onDirtyAtomic(_slateBlockData.refId, _slateBlockData.type)
        return _fragAccum
        // dispatch addDirtyAtomic
      }

      // // if values exist in our current state, replace with an updated value
      // if (!_dictSource) {
      //   return _fragAccum
      // }

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
      const _editor = editorInstance()
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

/*
checks for leaf nodes and makes sure if atomic is selected, selection is extended to cover full atomic
*/
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
          if (_firstBlock.text.length !== 0) {
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
          if (_lastBlock.text.length !== 0) {
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

export const getPasteData = (
  event,
  editor,
  sourceState,
  getSource,
  onDirtyAtomic
) => {
  let _pasteData

  if (isAtomicInlineType(editor.value.anchorBlock.type)) {
    return null
  }

  // if new block is created in reducer
  // use this _id
  const _beforeBlockId = ObjectId().toHexString()
  const _beforeBlockRef = ObjectId().toHexString()
  const _afterBlockId = ObjectId().toHexString()
  const _afterBlockRef = ObjectId().toHexString()

  const { value } = editor
  const _offset = value.selection.anchor.offset
  const transfer = getEventTransfer(event)

  const { fragment, type, text } = transfer

  if (!text) {
    return null
  }

  let _frag = fragment
  // get anchor block from slate,
  const anchorKey = value.anchorBlock.key

  // if anchor block is not empty and first fragment is atomic
  // prompt a warning that pasting atomic blocks is only
  if (type === 'fragment' || isFragmentFullBlock(fragment, value.document)) {
    if (_frag.nodes.size > 1) {
      _frag = trimFragment(_frag)
    }

    // get list of refId and Id of fragment to paste,
    // this list is used to keep slate and state in sync
    let _blockList = blocksToState(_frag.nodes)

    const { blockList, frag } = updateClipboardRefs({
      blockList: _blockList,
      fragment: _frag,
      sourceCache: sourceState.cache,
      getSource,
      onDirtyAtomic,
    })
    _blockList = blockList
    _frag = frag

    _pasteData = {
      anchorKey,
      blockList: _blockList,
      fragment: _frag,
      offset: _offset,
      beforeBlockId: _beforeBlockId,
      beforeBlockRef: _beforeBlockRef,
      afterBlockId: _afterBlockId,
      afterBlockRef: _afterBlockRef,
    }
    return _pasteData
  }

  // if plaintext or html is pasted
  const _textData = getFragFromText(transfer.text)
  const _blockList = _textData._blockList
  _frag = _textData._frag
  _pasteData = {
    anchorKey,
    blockList: _blockList,
    fragment: _frag,
    offset: _offset,
    beforeBlockId: _beforeBlockId,
    beforeBlockRef: _beforeBlockRef,
    afterBlockId: _afterBlockId,
    afterBlockRef: _afterBlockRef,
  }
  return _pasteData
}

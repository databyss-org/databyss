import { Block } from 'slate'

/**
 * A Slate plugin to insert a spesific node when enter is hit on a void node.
 *
 * @param {Mixed} ...args
 * @return {Object}
 */

function InsertBlockOnEnterPlugin(...args) {
  const blockArg = args[0]
  let blockInputProps
  const defaultProps = { object: 'block' }

  if (!blockArg) {
    throw new Error(
      'You must pass a block type (string) or object for the block to insert.'
    )
  }
  if (args[0].constructor.name === 'String') {
    blockInputProps = Object.assign({}, defaultProps, { type: blockArg })
  } else {
    blockInputProps = Object.assign({}, defaultProps, blockArg)
  }

  /**
   *
   * @param {Event} e
   * @param {Change} change
   * @return {Change}
   */

  function onKeyDown(e, editor, next) {
    const { value } = editor
    if (e.key === 'Enter') {
      const { document, selection, startBlock } = value
      const { start, end } = selection
      if (
        startBlock &&
        editor.query('isVoid', startBlock) &&
        start.key === end.key
      ) {
        const nextBlock = document.getNextBlock(start.key)
        const prevBlock = document.getPreviousBlock(start.key)
        const blockToInsert = Block.create(blockInputProps)
        // Void block at the end of the document
        if (!nextBlock) {
          return editor
            .moveToEndOfNode(startBlock)
            .insertBlock(blockInputProps)
            .moveToEnd()
        }
        // Void block between two blocks
        if (nextBlock && prevBlock) {
          return editor.moveToEndOfNode(startBlock).insertBlock(blockToInsert)
        }
        // Void block in the beginning of the document
        if (nextBlock && !prevBlock) {
          return editor
            .moveToStartOfNode(startBlock)
            .insertNodeByKey(document.key, 0, blockToInsert)
        }
      }
    }
    return next()
  }

  /**
   * Return the plugin.
   */

  return {
    onKeyDown,
  }
}

/**
 * Export.
 */

export default InsertBlockOnEnterPlugin

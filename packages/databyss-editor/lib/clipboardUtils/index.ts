import { uid } from '@databyss-org/data/lib/uid'
import { BlockType } from '@databyss-org/services/interfaces'
import { Text, Range, Selection, Block } from '../../interfaces'
import { isAtomicInlineType } from '../util'
import { stateToHTMLString } from '../slateUtils'
import { htmlToDatabyssFrag } from './databyssFragToHtmlString'

export { default as splitTextAtOffset } from './splitTextAtOffset'
export { default as getFragmentAtSelection } from './getFragmentAtSelection'
export { default as insertText } from './insertText'
export { default as deleteBlocksAtSelection } from './deleteBlocksAtSelection'

// return a new, empty block
// if @_id param is null or undefined, generate a uid
export const makeEmptyBlock = (_id?: string): Block => ({
  type: BlockType.Entry,
  text: { textValue: '', ranges: [] },
  _id: uid(),
})

// checks is state selection is collapsed
export const isSelectionCollapsed = (selection: Selection): boolean => {
  const { anchor, focus } = selection
  return anchor.index === focus.index && anchor.offset === focus.offset
}

// return atomic or new id
export const fragmentId = (type: BlockType, id: string): string =>
  isAtomicInlineType(type) ? id : uid()

// takes blocks array and resets the id's for non atomic types
export const resetIds = (fragment: Block[]): Block[] =>
  fragment.map((block) => ({
    ...block,
    _id: fragmentId(block.type, block._id),
  }))

export const addBlockUIFields = (frag: Block[]): Block[] =>
  frag.map((b) => ({ ...b, __showNewBlockMenu: false, __isActive: false }))

// always have the anchor come before the focus
export const sortSelection = (selection: Selection): Selection => {
  const { anchor, focus, _id } = selection

  if (
    anchor.index > focus.index ||
    (anchor.offset > focus.offset && anchor.index === focus.index)
  ) {
    return {
      anchor: focus,
      focus: anchor,
      _id,
    }
  }
  return { anchor, focus, _id }
}

export const mergeText = (a: Text, b: Text): Text => {
  const mergedTextValue = (a?.textValue ?? '') + (b?.textValue ?? '')

  const mergedRanges = [
    ...(a?.ranges || []),
    ...(b?.ranges || []).map((r: Range) => ({
      ...r,
      offset: r.offset + (a?.textValue?.length ?? 0),
    })),
  ].filter((r) => r.length > 0)

  const mergedText = {
    textValue: mergedTextValue,
    ranges: mergedRanges,
  }

  return mergedText
}

export const databyssFragToPlainText = (fragment: Block[]): string =>
  fragment.reduce(
    (acc, curr) =>
      acc + (acc.length ? '\n' : '') + (curr.text?.textValue ?? ''),
    ''
  )

export const plainTextToDatabyssFrag = (text: string): Block[] => {
  const _frag = text
    .split('\n')
    .filter((t) => t.length)
    .map((f) => ({
      text: { textValue: f, ranges: [] },
      type: BlockType.Entry,
      _id: uid(),
    }))
  return addBlockUIFields(_frag)
}

export const databyssFragToHtmlString = (frag: Block[]): string =>
  stateToHTMLString(frag)

export const cutOrCopyEventHandler = (
  e: ClipboardEvent,
  fragment: Block[]
): void => {
  // set plain text
  e.clipboardData!.setData('text/plain', databyssFragToPlainText(fragment))

  // set application data for clipboard
  e.clipboardData!.setData(
    'application/x-databyss-frag',
    JSON.stringify(fragment)
  )

  // SET HTML
  e.clipboardData!.setData('text/html', databyssFragToHtmlString(fragment))
}

export const pasteEventHandler = (e: ClipboardEvent): Block[] | null => {
  // databyss paste fragment
  const databyssDataTransfer = e.clipboardData!.getData(
    'application/x-databyss-frag'
  )

  if (databyssDataTransfer) {
    let data = JSON.parse(databyssDataTransfer)

    data = resetIds(data)
    return data
  }

  //  check for html text fragment
  const richTextDataTransfer = e.clipboardData!.getData('text/html')
  if (richTextDataTransfer) {
    try {
      const data = htmlToDatabyssFrag(richTextDataTransfer)
      return data
    } catch (err) {
      console.error(err)
    }
  }

  // plaintext text fragment
  const plainTextDataTransfer = e.clipboardData!.getData('text/plain')

  if (plainTextDataTransfer) {
    const data = plainTextToDatabyssFrag(plainTextDataTransfer)
    return data
  }

  return null
}

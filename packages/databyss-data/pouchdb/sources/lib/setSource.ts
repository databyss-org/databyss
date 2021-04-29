import { Source, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsert } from '../../utils'
import { InlineTypes } from '../../../../databyss-services/interfaces/Range'
import { updateInlines } from '../../../../databyss-editor/lib/inlineUtils/updateInlines'

export const setSource = async (data: Source) => {
  const { text, detail, _id, sharedWithGroups } = data as any
  const blockFields = {
    _id,
    text,
    type: BlockType.Source,
    doctype: DocumentType.Block,
    detail,
    sharedWithGroups,
  }

  await upsert({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })

  await updateInlines({
    inlineType: InlineTypes.InlineSource,
    text,
    _id,
  })
}

export default setSource

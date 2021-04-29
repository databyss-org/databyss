import {
  Source,
  BlockType,
  BlockRelation,
  Block,
} from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsert, findOne, getDocument } from '../../utils'
import { replicateSharedPage } from '../../groups/index'
import { Page } from '../../../../databyss-services/interfaces/Page'
import { InlineTypes } from '../../../../databyss-services/interfaces/Range'
import { replaceInlineText } from '../../../../databyss-editor/state/util'
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

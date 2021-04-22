import { Page, PageHeader } from '@databyss-org/services/interfaces/Page'
import { upsertImmediate } from '../../utils'
import { DocumentType } from '../../interfaces'

const savePageHeader = async (data: Page | PageHeader) => {
  await upsertImmediate({
    doctype: DocumentType.Page,
    _id: data._id,
    doc: data,
  })
}

export default savePageHeader

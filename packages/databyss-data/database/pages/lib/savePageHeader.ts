import { Page, PageHeader } from '@databyss-org/services/interfaces/Page'
import { upsert } from '../../utils'
import { DocumentType } from '../../interfaces'

const savePageHeader = async (data: Page | PageHeader) => {
  await upsert({ $type: DocumentType.Page, _id: data._id, doc: data })
}

export default savePageHeader

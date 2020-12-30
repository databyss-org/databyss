import { Page, PageHeader } from '../../../interfaces/Page'
import { db, addTimeStamp } from '../../db'
// import { asyncErrorHandler } from '../../util'

const savePageHeader = async (data: Page | PageHeader) => {
  await db.upsert(data._id, (oldDoc) => ({ ...oldDoc, ...addTimeStamp(data) }))
}

export default savePageHeader
// export default asyncErrorHandler(savePageHeader)

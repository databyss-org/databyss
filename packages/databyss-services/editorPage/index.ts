import * as pouchDb from '@databyss-org/data/pouchdb/pages'
import { httpPost } from '../lib/requestApi'
import {
  PatchBatch,
  PageHeader,
  ResourceNotFoundError,
  Page,
} from '../interfaces'
// TODO: Add native versions of these

// save page is used to rename page name
export const savePageHeader = (data: Page | PageHeader): Promise<void> =>
  pouchDb.savePageHeader(data)

export const savePage = (page: Page): Promise<any> => pouchDb.savePage(page)

export const savePatchBatch = async (data: PatchBatch) =>
  pouchDb.savePatchData(data)

export const loadPage = (_id: string): Promise<Page | ResourceNotFoundError> =>
  pouchDb.populatePage(_id)

export const deletePage = (id: string) => pouchDb.deletePage(id)

export const setPagePublic = (id: string, bool: boolean, accountId: string) =>
  httpPost(`/pages/${id}/public/`, { data: { isPublic: bool, accountId } })

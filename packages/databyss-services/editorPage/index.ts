import PCancelable from 'p-cancelable'
import * as pouchDb from '@databyss-org/data/pouchdb/pages'
import { httpPost } from '../lib/requestApi'
import {
  PatchBatch,
  PageHeader,
  ResourceNotFoundError,
  Page,
} from '../interfaces'
import { setPouchSecret } from '../session/clientStorage'
// TODO: Add native versions of these

// save page is used to rename page name
export const savePageHeader = (data: Page | PageHeader): Promise<void> =>
  pouchDb.savePageHeader(data)

export const savePage = (page: Page): Promise<any> => pouchDb.savePage(page)

export const savePatchBatch = async (data: PatchBatch) =>
  pouchDb.savePatchData(data)

export const loadPage = (
  _id: string
): PCancelable<Page | ResourceNotFoundError> => pouchDb.populatePage(_id)

export const deletePage = (id: string) => pouchDb.deletePage(id)

export const setPagePublic = (id: string, bool: boolean, accountId: string) =>
  httpPost(`/pages/${id}/public/`, { data: { isPublic: bool, accountId } })

export const validateGroupCredentials = ({
  groupId,
  dbKey,
}: {
  groupId: string
  dbKey: string
}) =>
  httpPost(`/cloudant/groups/${groupId}/auth/`, {
    data: {
      credentials: {
        dbKey,
      },
    },
  })

export const createDatabaseCredentials = async ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic?: boolean
}) => {
  const _res = await httpPost(`/cloudant/groups/${groupId}/credentials/`, {
    data: {
      isPublic,
    },
  })

  // set the credentials to local storage
  const cred = Object.values(_res.data)
  setPouchSecret(cred)
}

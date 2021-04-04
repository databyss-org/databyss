import { SysUser, Role } from '@databyss-org/data/interfaces'
import { updateDesignDoc } from '@databyss-org/data/couchdb/util'
import { uidlc } from '@databyss-org/data/lib/uid'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { DocumentScope } from 'nano'
import { Page } from '../../../databyss-services/interfaces/Page'
import { BlockType } from '../../../databyss-services/interfaces/Block'
import {
  UserPreference,
  DocumentType,
  PageDoc,
} from '../../../databyss-data/pouchdb/interfaces'

export interface CredentialResponse {
  dbKey: string
  dbPassword: string
  groupId: string
  role: Role
}

/*
TODO: importing this function causes server to fail

*/
export const normalizePage = (page: Page): PageDoc => {
  const _pageDoc: PageDoc = {
    blocks: [{ _id: page.blocks[0]._id, type: BlockType.Entry }],
    selection: page.selection._id,
    _id: page._id,
    name: page.name,
    archive: page.archive,
  }
  return _pageDoc
}

export const initializeNewPage = async ({
  groupId,
  pageId,
}: {
  groupId: string
  pageId: string
}) => {
  // get user group
  const groupDb = await cloudant.current.db.use(`g_${groupId}`)
  const _page: any = new Page(pageId)
  // upsert selection
  await groupDb.upsert(_page.selection._id, () => ({
    doctype: DocumentType.Selection,
    createdAt: Date.now(),
    belongsToGroup: groupId,
    ..._page.selection,
  }))
  // upsert blocks
  await groupDb.upsert(_page.blocks[0]._id, () => ({
    doctype: DocumentType.Block,
    createdAt: Date.now(),
    belongsToGroup: groupId,
    ..._page.blocks[0],
  }))

  await groupDb.upsert(_page._id, () => ({
    createdAt: Date.now(),
    doctype: DocumentType.Page,
    belongsToGroup: groupId,
    ...normalizePage(_page),
  }))
}

// TODO: rename to createGroup, because it doesn't just create the id
export const createGroupId = async ({
  groupId,
  userId,
}: {
  userId: string
  groupId?: string
}) => {
  // TODO: fix this so its not 'any'
  const _id: string = groupId || uidlc()
  const Groups: any = await cloudant.current.db.use('groups')
  try {
    await Groups.insert({
      // TODO: this should be "belongsToUser" for consistency
      belongsToUserId: userId,
      name: 'untitled',
      sessions: [],
      // TODO: cloudant does not allow uppercase for db names,
      // will this affect collisions?
      _id,
    })
  } catch (err) {
    // group might already exist
    if (err.error !== 'conflict') {
      // TODO: Make sure user owns group
      throw err
    }
  }

  return _id
}

/*
deletes group id from cloudant Groups database, the user should already be verified to have access to this database
*/
export const deleteGroupId = async ({ groupId }) => {
  const Groups = await cloudant.current.db.use('groups')
  const _doc = await Groups.get(groupId)
  if (_doc) {
    const latestRev = _doc._rev
    await Groups.destroy(groupId, latestRev)
  }
}

export const createGroupDatabase = async (
  id: string
): Promise<DocumentScope<any>> => {
  // database are not allowed to start with a number
  let _db
  try {
    await cloudant.current.db.get(id)
    _db = await cloudant.current.db.use<any>(id)

    return _db
  } catch (err) {
    if (err.error !== 'not_found') {
      throw err
    }
    await cloudant.current.db.create(id)
    // add design docs to sever
    _db = await cloudant.current.db.use<any>(id)
    await updateDesignDoc({ db: _db })

    return _db
  }
}

const getSecurity = (groupId: string): Promise<{ [key: string]: string[] }> =>
  new Promise((resolve, reject) => {
    // get group db
    const groupDb: any = cloudant.current.db.use(groupId)
    let security: { [key: string]: string[] } = {}

    // get security object if it exists
    groupDb.get_security((err, result) => {
      if (err) {
        reject(err)
      }
      if (result?.cloudant) {
        security = result.cloudant
      }
      resolve(security)
    })
  })

export const setSecurity = ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic?: boolean
}): Promise<CredentialResponse> =>
  new Promise((resolve, reject) => {
    const _credentials = {
      dbKey: '',
      dbPassword: '',
      groupId: '',
      role: Role.GroupAdmin,
    }
    cloudant.current.generate_api_key(async (err, api) => {
      if (err) {
        reject(err)
      }
      // gets security dictionary
      const security = await getSecurity(groupId)
      // TODO: use group schema to create typescript interface
      const groupDb: any = cloudant.current.db.use(groupId)

      // define permissions for new credentials

      // if page is public, allow read and replication permission
      if (isPublic) {
        security.nobody = ['_reader', '_replicator']
      } else {
        security.nobody = []
      }

      security[api.key] = ['_reader', '_writer', '_replicator']

      await groupDb.set_security(security, (err: any) => {
        if (err) {
          reject(err)
        }
        _credentials.dbKey = api.key
        _credentials.dbPassword = api.password
        _credentials.groupId = groupId.substr(2)

        resolve(_credentials)
      })
    })
  })

const addSessionToGroup = async (
  userId: string,
  credentials: CredentialResponse
) => {
  const _res = await cloudant.models.Groups.upsert(
    credentials.groupId,
    (oldDoc: any) => {
      const _sessions = oldDoc.sessions || []
      _sessions.push({
        userId,
        clientInfo: 'get client info',
        // dbKey: credentials.dbKey,
        lastLoginAt: Date.now(),
        role: credentials.role,
      })
      return { ...oldDoc, sessions: _sessions }
    }
  )
  return _res
}

/*
generates credentials for given groupID with given user
*/
export const addCredentialsToGroupId = async ({
  groupId,
  userId,
}: {
  groupId: string
  userId: string
}) => {
  // set user as GROUP_ADMIN and return credentials
  const response = await setSecurity({ groupId: `g_${groupId}` })
  // add the user session to groups
  await addSessionToGroup(userId, response)

  // new default pageID is created here
  return { ...response }
}

export const createUserDatabaseCredentials = async (
  user: SysUser
): Promise<CredentialResponse> => {
  let groupId = user.defaultGroupId

  // create new group if user does not have one
  if (!groupId) {
    groupId = await createGroupId({ userId: user._id })

    // creates a database if not yet defined
    const _db = await createGroupDatabase(`g_${groupId}`)
    // add user preferences to user database

    const defaultPageId = uidlc()
    const _userPreferences: UserPreference = {
      _id: 'user_preference',
      userId: user._id,
      email: user?.email,
      belongsToGroup: groupId,
      createdAt: Date.now(),
      groups: [
        {
          groupId,
          // creates a new default page id
          defaultPageId,
          role: Role.GroupAdmin,
        },
      ],
    }

    await initializeNewPage({
      groupId,
      pageId: defaultPageId,
    })

    await _db.upsert(_userPreferences._id, () => ({
      ..._userPreferences,
      doctype: DocumentType.UserPreferences,
    }))

    // add defaultPageId to Userdb
    await cloudant.models.Users.upsert(_userPreferences.userId, (oldDoc) => ({
      ...oldDoc,
      defaultGroupId: _userPreferences.belongsToGroup,
    }))
  }

  // add credentials to new database
  const response = await addCredentialsToGroupId({
    groupId,
    userId: user._id,
  })

  return response
}

export const addCredientialsToSession = async ({
  groupId,
  userId,
  session,
}: {
  groupId: string
  userId: string
  // TODO: SESSION SHOULD BE AN OBJECT
  session: any
}) => {
  const credentials = await addCredentialsToGroupId({
    groupId,
    userId,
  })

  session.user.groups = [
    {
      ...credentials,
    },
  ]
  return session
}

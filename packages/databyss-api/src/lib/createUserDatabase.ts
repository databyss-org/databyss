import { Users, Groups } from '@databyss-org/data/couchdb'
import { User, Role } from '@databyss-org/data/interfaces'
import { updateDesignDoc } from '@databyss-org/data/couchdb/util'
import { uid, uidlc } from '@databyss-org/data/lib/uid'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'

import { DocumentScope } from 'nano'
import {
  UserPreference,
  DocumentType,
} from '../../../databyss-data/pouchdb/interfaces'

interface CredentialResponse {
  dbKey: string
  dbPassword: string
  groupId: string
  role: Role
}

export const createGroupId = async () => {
  // TODO: fix this so its not 'any'
  const Groups: any = await cloudant.db.use('groups')
  const group = await Groups.insert({
    name: 'untitled',
    sessions: [],
    // cloudant does not allow uppercase for db names so use lowercase uid generator
    _id: uidlc(),
  })
  return group.id
}

export const createGroupDatabase = async (
  id: string
): Promise<DocumentScope<any>> => {
  // database are not allowed to start with a number
  let _db
  try {
    await cloudant.db.get(`g_${id}`)
    _db = await cloudant.db.use<any>(`g_${id}`)
    return _db
  } catch (err) {
    if (err.error !== 'not_found') {
      throw err
    }
    await cloudant.db.create(`g_${id}`)
    // add design docs to sever
    _db = await cloudant.db.use<any>(`g_${id}`)
    await updateDesignDoc({ db: _db })
    return _db
  }
}

const setSecurity = (groupId: string): Promise<CredentialResponse> =>
  new Promise((resolve, reject) => {
    const _credentials = {
      dbKey: '',
      dbPassword: '',
      groupId: '',
      role: Role.GroupAdmin,
    }
    cloudant.generate_api_key(async (err, api) => {
      if (err) {
        reject(err)
      }

      const security: { [key: string]: string[] } = {}
      // define permissions
      security[api.key] = ['_reader', '_writer', '_replicator']

      // TODO: use group schema to create typescript interface
      const groupDb: any = cloudant.db.use(`g_${groupId}`)

      await groupDb.set_security(security, (err: any) => {
        if (err) {
          reject(err)
        }
        _credentials.dbKey = api.key
        _credentials.dbPassword = api.password
        _credentials.groupId = groupId
        resolve(_credentials)
      })
    })
  })

const addSessionToGroup = async (
  userId: string,
  credentials: CredentialResponse
) => {
  const _res = await Groups.upsert(credentials.groupId, (oldDoc: any) => {
    const _sessions = oldDoc.sessions || []
    _sessions.push({
      userId,
      clientInfo: 'get client info',
      dbKey: credentials.dbKey,
      lastLoginAt: Date.now(),
      role: credentials.role,
    })
    return { ...oldDoc, sessions: _sessions }
  })
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
  const response = await setSecurity(groupId)
  // add the user session to groups
  const _group = await addSessionToGroup(userId, response)

  return { ...response, defaultPageId: _group.defaultPageId }
}

export const createUserDatabaseCredentials = async (
  user: User
): Promise<CredentialResponse> => {
  const _groupId: string = await createGroupId()

  // creates a database if not yet defined
  const _db = await createGroupDatabase(_groupId)
  // add user preferences to user database
  const _userPreferences: UserPreference = {
    _id: 'user_preference',
    $type: DocumentType.UserPreferences,
    userId: user._id,
    email: user?.email,
    defaultGroupId: _groupId,
    createdAt: Date.now(),
    groups: [
      {
        groupId: _groupId,
        defaultPageId: uid(),
        role: Role.GroupAdmin,
      },
    ],
  }

  _db.upsert(_userPreferences._id, () => _userPreferences)

  // add credentials to new database
  const response = await addCredentialsToGroupId({
    groupId: _groupId,
    userId: user._id,
  })

  return response
}

export const addCredentialsToUser = async (
  userId: string,
  credentials: CredentialResponse
): Promise<any /* this should extend User with property  */> => {
  let _defaultPageId

  const _res = await Users.upsert(userId, (oldDoc: User) => {
    _defaultPageId = uid()

    // check if group has default page id, if not, create id
    Groups.upsert(credentials.groupId, (_oldDoc) =>
      _oldDoc.defaultPageId
        ? _oldDoc
        : { ..._oldDoc, defaultPageId: _defaultPageId }
    )

    return {
      ...oldDoc,
      defaultGroupId: credentials.groupId,
    }
  })

  return { ..._res, defaultPageId: _defaultPageId }
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

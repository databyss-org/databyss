import { User, Group, Login, DesignDoc } from '../interfaces'
import { cloudant } from './cloudant'

export { updateDesignDocs, initiateDatabases } from './util'

export const Users = cloudant.db.use<User>('users')
export const UsersDesignDoc = cloudant.db.use<DesignDoc>('users')
export const Logins = cloudant.db.use<Login>('logins')
export const LoginsDesignDoc = cloudant.db.use<DesignDoc>('logins')
export const Groups = cloudant.db.use<Group>('groups')
export const GroupsDesignDoc = cloudant.db.use<DesignDoc>('groups')

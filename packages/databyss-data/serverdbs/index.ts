import { cloudant } from '@databyss-org/services/lib/cloudant'
import { CouchDB, User, Group, Login } from '../interfaces'

export const Users: CouchDB<User> = cloudant.db.use('users')
export const Logins: CouchDB<Login> = cloudant.db.use<Login>('logins')
export const Groups: CouchDB<Group> = cloudant.db.use<Group>('groups')

import { cloudant } from '@databyss-org/services/lib/cloudant'
import { CouchDB, User, Group, Login } from '../interfaces'

export const Users = cloudant.db.use<User>('users')
export const Logins = cloudant.db.use<Login>('logins')
export const Groups = cloudant.db.use<Group>('groups')

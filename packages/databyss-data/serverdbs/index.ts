import { cloudant } from '@databyss-org/services/lib/cloudant'
import { User, Group, Login, DesignDoc } from '../interfaces'

export const Users = cloudant.db.use<User>('users')
export const UsersDesignDoc = cloudant.db.use<DesignDoc>('users')
export const Logins = cloudant.db.use<Login>('logins')
export const LoginsDesignDoc = cloudant.db.use<DesignDoc>('logins')
export const Groups = cloudant.db.use<Group>('groups')
export const GroupsDesignDoc = cloudant.db.use<DesignDoc>('groups')

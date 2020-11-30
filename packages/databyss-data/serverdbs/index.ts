import { cloudant } from '@databyss-org/services/lib/cloudant'

export const Users = cloudant.db.use('users')
export const Login = cloudant.db.use('login')

import { ServerScope } from '@cloudant/cloudant'

export interface DatabaseState {
  db: ServerScope | null
}

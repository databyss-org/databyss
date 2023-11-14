import * as dbApi from './db-api'

// api exports functions that make up the frontend api, ie that in
// turn either do IPC calls to main for db communication or use
// allowed nodejs features like file i/o.
// Example `my-feature.ts`:
// export const fetchX = async (): Promise<X> => { ... }

export default {
  db: dbApi,
}

import { EventEmitter } from 'events'
import PouchDB from 'pouchdb'

export class DbRef extends EventEmitter {
  current: PouchDB.Database<any> | null = null
  readOnly: boolean = false
  lastSeq: string | number = 'now'
  initialSyncComplete: boolean = false
  // seq of last upsertReplication
  lastReplicationSeq: string | number = 'now'
  searchIndexProgress: number = 0 // 0 to 1
  private _groupId: string | null = null

  get groupId() {
    return this._groupId
  }
  set groupId(groupId: string | null) {
    this._groupId = groupId
    this.emit('groupIdUpdated')
  }
}

export const dbRef = new DbRef()

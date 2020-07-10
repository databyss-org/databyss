import { Patch } from 'immer'

export interface PatchBatch {
  id: string // page._id
  patches: Patch[]
}

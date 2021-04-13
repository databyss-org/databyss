import { Patch } from 'immer'

export interface ExtendedPatch extends Patch {
  sharedWithGroups?: string[]
}

export interface PatchBatch {
  id: string // page._id
  patches: ExtendedPatch[]
}

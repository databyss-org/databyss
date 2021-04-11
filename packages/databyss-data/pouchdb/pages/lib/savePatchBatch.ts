import { PatchBatch } from '@databyss-org/services/interfaces/Patch'
import { runPatches } from '../util'

// TODO: WRAP THIS IN ERROR HANDLER
const savePatchBatch = async (
  data: PatchBatch,
  sharedWithGroups?: string[]
) => {
  const { patches } = data
  if (!patches) {
    return
  }
  console.log('[savePatchBatch] sharedWithGroups', sharedWithGroups)
  for (const patch of patches) {
    runPatches({ ...patch, sharedWithGroups })
  }
}

export default savePatchBatch

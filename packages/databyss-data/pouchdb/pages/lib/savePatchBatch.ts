import { PatchBatch } from '@databyss-org/services/interfaces/Patch'
import { runPatches } from '../util'

// TODO: WRAP THIS IN ERROR HANDLER
const savePatchBatch = async (data: PatchBatch) => {
  const { patches } = data
  if (!patches) {
    return
  }
  for (const patch of patches) {
    runPatches(patch)
  }
}

export default savePatchBatch

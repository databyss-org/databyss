import { useState } from 'react'
import {
  ResourceResponse,
  ResourcePending,
} from '@databyss-org/services/interfaces'
import { dbRef } from '../db'

export const useBlock = <blockType>(id: string): blockType | null => {
  const [doc, setDoc] = useState<ResourceResponse<blockType>>(null)
  if (doc && !(doc instanceof ResourcePending) && !(doc instanceof Error)) {
    return doc
  }
  if (doc instanceof ResourcePending) {
    return null
  }
  if (doc instanceof Error) {
    throw doc
  }
  dbRef.current
    .get(id)
    .then((res) => setDoc(res))
    .catch((err) => setDoc(err))
  setDoc(new ResourcePending())
  return null
}

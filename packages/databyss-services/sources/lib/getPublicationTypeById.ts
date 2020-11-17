import { PublicationTypes } from '../constants/PublicationTypes'

export function getPublicationTypeById(id: string) {
  return PublicationTypes.find((type) => type.id === id)
}

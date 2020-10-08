import { PublicationTypes } from '../constants/PublicationTypes'

export function getPublicationTypeById(id) {
  return PublicationTypes.find(type => type.id === id)
}

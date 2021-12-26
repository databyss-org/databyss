import { Author } from '../../interfaces'

export function isCurrentAuthor(
  authors: Author[],
  firstNameQuery: string | null,
  lastNameQuery: string | null
) {
  if (!authors) {
    return false
  }

  return authors.some((author) => {
    const firstName = author.firstName?.textValue
    const lastName = author.lastName?.textValue

    // iif firstName or lastName is missing, only check the one defined
    if (firstName === undefined && lastName) {
      return lastName === lastNameQuery
    }
    if (lastName === undefined && firstName) {
      return firstName === firstNameQuery
    }

    return firstName === firstNameQuery && lastName === lastNameQuery
  })
}

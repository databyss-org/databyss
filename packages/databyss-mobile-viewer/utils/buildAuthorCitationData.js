import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'

export const buildAuthorCitationData = (
  data,
  firstNameQuery,
  lastNameQuery
) => {
  const unsortedEntries = Object.values(data).map(value => {
    const isCurrentAuthor = value.detail?.authors?.some(author => {
      const firstName = author.firstName?.textValue
      const lastName = author.lastName?.textValue
      // If firstName or LastName is missing, only check the one defined
      if (firstName === undefined && lastName) {
        return lastName === lastNameQuery
      }
      if (lastName === undefined && firstName) {
        return firstName === firstNameQuery
      }

      return firstName === firstNameQuery && lastName === lastNameQuery
    })

    if (isCurrentAuthor) {
      return createIndexPageEntries({
        id: value._id,
        text: value.text.textValue,
        citations: value.detail?.citations?.map(
          citation => citation.text?.textValue
        ),
        type: 'sources',
      })
    }

    return {}
  })

  const sortedEntries = sortEntriesAtoZ(unsortedEntries, 'text')

  return sortedEntries
}

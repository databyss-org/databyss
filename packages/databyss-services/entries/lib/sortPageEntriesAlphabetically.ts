import { Text } from '../../interfaces'

interface Entry {
  text: Text
}

export function sortPageEntriesAlphabetically(entries: Entry[]) {
  // error checks
  if (!entries) {
    throw new Error(
      'sortPageEntriesAlphabetically() expected an array to sort,' +
        'but none was provided'
    )
  }

  // defensive checks
  if (!entries.length) {
    return entries
  }

  // sort
  return entries.sort((a, b) =>
    a.text.textValue.toLowerCase() > b.text.textValue.toLowerCase() ? 1 : -1
  )
}

import { Text } from '../../interfaces'

export function sortByTextValueAlphabetically(array: Text[]) {
  // error checks
  if (!array) {
    throw new Error(
      'sortByTextValueAlphabetically() expected an array to sort,' +
        'but none was provided'
    )
  }

  // defensive checks
  if (!array.length) {
    return array
  }

  // sort
  return array.sort(
    (a, b) => (a.textValue.toLowerCase() > b.textValue.toLowerCase() ? 1 : -1)
  )
}

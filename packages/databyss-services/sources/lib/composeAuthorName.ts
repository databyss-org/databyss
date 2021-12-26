export function composeAuthorName(
  firstName: string | null,
  lastName: string | null
) {
  if (firstName && lastName) {
    return `${lastName}, ${firstName}`
  }
  return lastName || firstName
}

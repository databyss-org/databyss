export function composeAuthorName(firstName: string, lastName: string) {
  if (firstName && lastName) {
    return `${lastName}, ${firstName}`
  }
  return lastName || firstName
}

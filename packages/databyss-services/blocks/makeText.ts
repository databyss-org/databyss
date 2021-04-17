import { Text } from '../interfaces/Text'

export function makeText(textValue: string): Text {
  return {
    textValue,
    ranges: [],
  }
}

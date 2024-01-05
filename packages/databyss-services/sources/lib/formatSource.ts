import { generateShortName } from "./generateShortName"

export const formatSource = (value) => {
  const _value = JSON.parse(JSON.stringify(value))
  // format year
  const year = value?.detail?.year?.textValue
  // TODO: THIS SHOULD BE TRUTHY IF ZERO

  if (typeof year === 'number' || year) {
    _value.detail.year.textValue = year.toString()
  }
  // ensure short name exists, if not create one
  if (!value.name) {
    _value.name = generateShortName(value)
  }

  return _value
}
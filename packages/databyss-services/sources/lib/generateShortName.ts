import { Source } from '../../interfaces'

export const generateShortName = (value: Source) => {
  const _name =
    value?.detail?.authors[0]?.lastName?.textValue ||
    value?.detail?.authors[0]?.firstName?.textValue

  const _year = value?.detail?.year?.textValue

  return _name && _year
    ? { textValue: `${_name} ${_year}`, ranges: [] }
    : value.text
}

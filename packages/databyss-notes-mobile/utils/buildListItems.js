/* eslint-disable no-plusplus */

import { get } from 'lodash'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { urlSafeName } from '@databyss-org/services/lib/util'

/**
 * @param {object} options Object containing these properties:
 * - {string} baseUrl: Prefix to add the item id (which is obtained from the data).
 * Must not include a trailing slash, but should include a leading slash.
 * - {object} data: Data object containing the items to list
 * - {string} labelPropPath: The path to the label or text property,
 * e.g.: `labelPropPath: 'text.textValue'`
 * - {SVG element} icon: An SVG element, passed like so: `icon: <SomeSVG />`.
 * The element name does not matter per se, but must be in DOM format.
 */
export const buildListItems = (options) => {
  const { baseUrl, data, labelPropPath, icon } = options

  const response = []

  const keys = Object.keys(data)
  keys.forEach((key) => {
    const element = data[key]
    const elementId = element._id || element.id
    const elementName =
      element.name?.textValue || element.name || element.text?.textValue
    let href = `${baseUrl}/${elementId}`
    if (elementName) {
      href = `${href}/${urlSafeName(elementName)}`
    }

    response.push({
      _id: elementId,
      label: get(element, labelPropPath),
      href,
      icon,
    })
  })

  return sortEntriesAtoZ(response, 'label')
}

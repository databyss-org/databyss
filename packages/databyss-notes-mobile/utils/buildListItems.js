/* eslint-disable no-plusplus */

import { get } from 'lodash'

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
export const buildListItems = options => {
  const { baseUrl, data, labelPropPath, icon } = options

  const response = []

  const keys = Object.keys(data)
  keys.forEach(key => {
    const element = data[key]
    const elementId = element._id || element.id

    response.push({
      _id: elementId,
      label: get(element, labelPropPath),
      href: `${baseUrl}/${elementId}`,
      icon,
    })
  })

  return response
}

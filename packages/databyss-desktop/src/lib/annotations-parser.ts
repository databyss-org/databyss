// constants
const annotationsTypes = ['Text', 'Highlight', 'Underline', 'Stamp']

/**
 * @param {array} annotations1 Annotations obtained from the modified PDFJS.
 * @param {array} annotations2 Annotations obtained from parsing with unmodified PDFJS.
 */
export function mergeAnnotations(annotations1, annotations2) {
  if (!annotations1) {
    throw new ReferenceError(
      'Method expects the annotations obtained in the first pass of parsing.'
    )
  }
  if (!annotations2) {
    throw new ReferenceError(
      'Method expects the annotations obtained in the second pass of parsing.'
    )
  }

  console.log('📑 Merging annotations')

  /* eslint-disable no-param-reassign */
  annotations1 = annotations1.filter((a) => annotationsTypes.includes(a.type))
  annotations2 = annotations2.filter((a) => annotationsTypes.includes(a.type))
  /* eslint-enable no-param-reassign */

  if (annotations1.length !== annotations2.length) {
    console.warn(
      '⚠️ The two arrays do not have the same amount of annotations.'
    )
  }

  const response = []

  annotations1.forEach((annotation) => {
    const newAnnotation = Object.assign({}, annotation)

    const filtered = annotations2.filter(
      (b) =>
        // raw id contains text, whereas id from modified annotation parser is only number
        // to match, ensure mod. annot. id is contained in raw id
        b.id.indexOf(annotation.id) > -1
    )

    if (filtered.length) {
      // array.filter provides an array, there should be only one match
      const other = filtered[0]

      if (other.contents) {
        newAnnotation.contents = other.contents
      }
      if (other.author) {
        newAnnotation.author = other.author
      }
    }

    response.push(newAnnotation)
  })

  console.log('📑 Number of annotations:', response.length)

  return response
}

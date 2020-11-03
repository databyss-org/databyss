/**
 * Trims the citation provided by CitationJS to remove the numbering.
 * Used when only one citation is required.
 * @param {string} citation A string of raw HTML provided by CitationJS.
 * @param {*} styleId The identifier of the citation style.
 */
export function pruneCitation(citation, styleId) {
  let response = citation

  const div = document.createElement('div')
  div.innerHTML = citation
  const cslEntries = div.getElementsByClassName('csl-entry')

  if (!cslEntries[0]) {
    return citation
  }

  switch (styleId) {
    case 'apa':
    case 'chicago':
    case 'harvard1':
    case 'mla':
      response = cslEntries[0].outerHTML
      break

    case 'american-medical-association':
    case 'ieee':
    case 'vancouver':
      const numberedEntry = cslEntries[0]
      const lastIndex = numberedEntry.children.length - 1
      if (lastIndex > 0) {
        const lastChild = numberedEntry.children[lastIndex]
        response = lastChild.outerHTML
      } else {
        response = ''
      }
      break
  }

  // TODO: remove class name and data attributes?

  return response
}

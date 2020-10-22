import CitationStyleIds from '../constants/CitationStyleIds'

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
    case CitationStyleIds.APA:
    case CitationStyleIds.CHICAGO:
    case CitationStyleIds.MLA:
      response = cslEntries[0].outerHTML
      break

    case CitationStyleIds.IEEE:
    case CitationStyleIds.VANCOUVER:
      const numberedEntry = cslEntries[0]
      const lastIndex = numberedEntry.children.length - 1
      const lastChild = numberedEntry.children[lastIndex]
      response = lastChild.outerHTML
      break
  }

  // TODO: remove class name and data attributes?

  return response
}

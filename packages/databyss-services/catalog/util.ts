import stripHtml from 'string-strip-html'

/**
 * Removes unwanted entities (e.g. html tags) from catalog results
 * @param text string or array of strings to cleanup
 */
export function stripText(text: string | string[]) {
  if (!text) {
    return text
  }
  if (Array.isArray(text)) {
    return text.map(t => stripHtml(t).result)
  }
  return stripHtml(text).result
}

export const getCatalogSearchType = (query: string) => {
  // DOI
  if (query.match(/^10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i)) {
    return 'DOI'
  }
  // ISBN
  if (query.match(/\b(\d\s*?){10,13}\b/gm)) {
    return 'ISBN'
  }
  return false
}

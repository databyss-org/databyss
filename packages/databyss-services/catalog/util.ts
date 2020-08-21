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

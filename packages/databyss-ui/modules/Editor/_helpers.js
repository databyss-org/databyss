export const menuAction = action => {
  switch (action.type) {
    case 'RESOURCE':
      return { text: '@', onClick: () => console.log('new entry ') }
    case 'LOCATION':
      return { text: '//', onClick: () => console.log('new entry ') }
    case 'ENTRY':
      return { text: '', onClick: () => console.log('new entry ') }
    case 'NEW_ENTRY':
      return { text: '+', onClick: () => console.log('new entry ') }
    case 'CLOSE':
      return { text: 'x', onClick: () => console.log('new entry ') }
    case 'NEW_SOURCE':
      return { text: '@', onClick: () => console.log('new entry ') }
    case 'NEW_LOCATION':
      return { text: '//', onClick: () => console.log('new entry ') }
    default:
      return { text: '', onClick: () => console.log('none') }
  }
}

export function htmlParser(htmlState, dispatch) {
  let text = htmlState.rawText
  text = text.replace(/<div>/gi, '\n')
  text = text.replace(/<\/div>/gi, '')
  text = text.replace(/<br>/gi, '\n')
  /*
  const regex = new RegExp(
    /\@(\w+)?\.?(\w+)?(\n*)?[[Pp]*]?[\.\s]?\s?(\d+)?[\-*]?(\d+)?\n*([\w\s]*)?/
  )
*/
  const regex = new RegExp(/\@(\w+)?(\n*)?/)

  const match = text.match(regex)
  let matches = {}
  if (match) {
    matches = {
      source: match[1],
      author: match[2],

      /*
      author: match[2],
      pageFrom: match[4],
      pageTo: match[5],
      entry: match[6],
      */
    }
  }
  let newHtmlState = { ...htmlState, entrySources: { ...matches } }

  if (match[2]) {
    dispatch({ type: 'NEW_LINE', data: { ...newHtmlState, type: 'new' } })
  }
  if (match[1] && !match[2]) {
    dispatch({ type: 'NEW_SOURCE' })
  }

  return newHtmlState
}

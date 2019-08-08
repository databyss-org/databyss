import _ from 'lodash'

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
  let newHtmlState = { ...htmlState }

  newHtmlState.html = newHtmlState.html.replace(/<div>/gi, '\n')
  // text = text.replace(/<div>/gi, '\n')
  newHtmlState.html = newHtmlState.html.replace(/<\/div>/gi, '')
  newHtmlState.html = newHtmlState.html.replace(/<br>/gi, '\n')

  //  let newHtmlState = { ...htmlState }

  const data = newHtmlState
  dispatch({ type: 'ON_CHANGE', data })
}

export const appendBlock = ({ blocks, newBlockInfo }) => {
  let newBlock = {
    type: newBlockInfo.type,
    data: newBlockInfo.rawText,
  }
  return blocks.concat([newBlock])
}

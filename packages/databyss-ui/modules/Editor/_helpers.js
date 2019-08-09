import React from 'react'
import _ from 'lodash'
// import { ServerStyleSheet } from 'styled-components'
import { Text } from '@databyss-org/ui/primitives'
import { renderToStaticMarkup } from 'react-dom/server'

// const sheet = new ServerStyleSheet()

export const styleSelector = type => {
  switch (type) {
    case 'RESOURCE':
      return 'bodyNormal'
    case 'LOCATION':
      return 'bodySmall'
    default:
      return 'bodyNormal'
  }
}

export const menuAction = action => {
  switch (action.type) {
    case 'RESOURCE':
      return { text: '', onClick: () => console.log('new entry ') }
    case 'LOCATION':
      return { text: '', onClick: () => console.log('new entry ') }
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
  let data = { ...htmlState }
  data.rawText = htmlToText(htmlState.html)
  if (htmlState.index > -1) {
    dispatch({ type: 'ON_EDIT', data })
  } else {
    dispatch({ type: 'ON_CHANGE', data })
  }
}

export const appendBlock = ({ blocks, newBlockInfo }) => {
  let { type, rawText, html } = newBlockInfo
  if (type === 'RESOURCE') {
    html = html.substr(1)
    rawText = rawText.substr(1)
    html = `<u>${htmlToText(html)}</u>`
  }
  if (type === 'LOCATION') {
    html = html.substr(2)
    rawText = rawText.substr(2)
    html = htmlToText(html)
  }
  if (type === 'TAG') {
    html = html.substr(1)
    rawText = rawText.substr(1)
    html = `<b>${htmlToText(html)}</b>`
  }
  if (type === 'ENTRY') {
    rawText = rawText.trim()
    html = html.replace('<div><br></div><div><br></div>', '')
  }

  const newBlock = {
    html: html,
    rawText: rawText,
    source: { name: '' },
    type: type,
    index: blocks.length,
  }
  return blocks.concat([newBlock])
}

/*
    Used to convert HTML text with <br> or other line
    breaks into a text string with new-line characters.
  */
function htmlToText(value) {
  // Convert `&amp;` to `&`.
  value = value.replace(/&amp;/gi, '&')

  // Replace spaces.
  value = value.replace(/&nbsp;/gi, ' ')
  value = value.replace(/\s+/g, ' ')

  // Remove "<b>".
  value = value.replace(/<b>/gi, '')
  value = value.replace(/<\/b>/gi, '')

  // Remove "<strong>".
  value = value.replace(/<strong>/gi, '')
  value = value.replace(/<\/strong>/gi, '')

  // Remove "<i>".
  value = value.replace(/<i>/gi, '')
  value = value.replace(/<\/i>/gi, '')

  // Remove "<em>".
  value = value.replace(/<em>/gi, '')
  value = value.replace(/<\/em>/gi, '')

  // Remove "<u>".
  value = value.replace(/<u>/gi, '')
  value = value.replace(/<\/u>/gi, '')

  // Tighten up "<" and ">".
  value = value.replace(/>\s+/g, '>')
  value = value.replace(/\s+</g, '<')

  // Replace "<br>".
  value = value.replace(/<br>/gi, '\n')

  // Replace "<div>" (from Chrome).
  value = value.replace(/<div>/gi, '\n')
  value = value.replace(/<\/div>/gi, '')

  // Replace "<p>" (from IE).
  value = value.replace(/<p>/gi, '\n')
  value = value.replace(/<\/p>/gi, '')

  // No more than 2x newline, per "paragraph".
  value = value.replace(/\n\n+/g, '\n\n')

  // Whitespace before/after.
  value = value.trim()

  return value
}

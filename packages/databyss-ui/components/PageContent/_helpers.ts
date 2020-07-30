import React, { useEffect } from 'react'

import { Block } from '@databyss-org/services/interfaces/'
import { isAtomicInlineType } from '@databyss-org/editor/lib/util'
import { EditorState } from '../../../databyss-editor/interfaces/index'
import { stateBlockToHtmlHeader } from '@databyss-org/editor/lib/slateUtils.js'
import { getOpenAtomics } from '../../../databyss-editor/state/util'

const getBlockPrefix = (type: string): string =>
  ({
    SOURCE: '@',
    TOPIC: '#',
  }[type])

export const getPagePath = (page: EditorState, pageName: string): string => {
  if (!page) {
    return ''
  }

  const _currentAtomics = getOpenAtomics(page)

  const _path: string[] = []
  // add page name as first path
  if (pageName) {
    _path.push(pageName)
  }
  _currentAtomics.reverse().forEach(_block => {
    _path.push(
      `${getBlockPrefix(_block.type)} ${stateBlockToHtmlHeader(_block)}`
    )
  })

  return _path.join(' / ')
}

import React, { useEffect, useCallback, useRef } from 'react'
import { throttle } from 'lodash'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'
import {
  withWhitelist,
  addMetaData,
} from '@databyss-org/services/pages/_helpers'

const PageBody = ({ page }) => {
  const { location } = useNavigationContext()
  const { clearBlockDict, setPatch } = usePageContext()
  useEffect(() => () => clearBlockDict(), [])

  const operationsQueue = useRef([])

  // throttled autosave occurs every SAVE_PAGE_THROTTLE ms when changes are happening
  const throttledAutosave = useCallback(
    throttle(({ state, patch }) => {
      const _patch = withWhitelist(patch)
      if (_patch.length) {
        const payload = {
          id: state.page._id,
          patch: operationsQueue.current,
        }
        setPatch(payload)
        operationsQueue.current = []
      }
    }, process.env.SAVE_PAGE_THROTTLE),
    []
  )

  // TODO: Not all events fire onchange even in editor
  // state from provider is out of date
  const onChange = value => {
    const _value = addMetaData(value)

    // push changes to a queue
    operationsQueue.current = operationsQueue.current.concat(_value.patch)
    throttledAutosave(_value)
  }

  return (
    <EditorProvider
      key={location.pathname}
      onChange={onChange}
      initialState={withMetaData(page)}
    >
      <ContentEditable autofocus />
    </EditorProvider>
  )
}

export default PageBody

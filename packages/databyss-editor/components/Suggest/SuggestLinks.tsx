import React, { useState, useEffect, useRef } from 'react'
import { Editor } from '@databyss-org/slate'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { usePages } from '@databyss-org/data/pouchdb/hooks/usePages'
import { validUriRegex } from '@databyss-org/services/lib/util'
import { Page } from '@databyss-org/services/interfaces/Page'
import {
  weightedSearch,
  prefixSearchAll,
} from '@databyss-org/services/blocks/filter'
import { Text, View } from '@databyss-org/ui/primitives'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { pxUnits } from '@databyss-org/ui/theming/theme'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'

import { setPageLink } from '../../lib/inlineUtils/setPageLink'

const SuggestLinks = ({ query, onSuggestionsChanged, menuHeight, dismiss }) => {
  const editor = useEditor() as ReactEditor & Editor
  // const embedRes = useBlocksInPages(BlockType.Embed)
  const pagesRes = usePages()

  const pendingSetContent = useRef(false)

  const [suggestions, setSuggestions] = useState<null | Page[]>(null)
  const filteredSuggestionLengthRef = useRef(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Page[]>([])

  useEffect(() => {
    filteredSuggestionLengthRef.current = filteredSuggestions.length
  }, [filteredSuggestions.length])

  const filterSuggestions = (pages) => {
    if (!pages.length) {
      return []
    }
    return query?.length
      ? pages
          .map(weightedSearch(query, 'name'))
          .filter(prefixSearchAll(query, 'name'))
          .sort((a, b) => (a.weight < b.weight ? 1 : -1))
      : []
  }

  const updateSuggestions = () => {
    if (!suggestions?.length) {
      return
    }
    const _nextSuggestions = filterSuggestions(suggestions)
    onSuggestionsChanged(_nextSuggestions)
    setFilteredSuggestions(_nextSuggestions)
  }

  useEffect(updateSuggestions, [query, suggestions])

  // save data
  const setPage = (page: Page | void) => {
    if (page) {
      pendingSetContent.current = true
      setPageLink({
        editor,
        suggestion: page,
      })
      // return
    } else {
      // look up in filtered suggestiong
      const _filtered = filteredSuggestions.filter((i) => i.name === query)
      if (_filtered.length) {
        const _page = _filtered[0]
        setPageLink({
          editor,
          suggestion: _page,
        })
      } else {
        // assume page link is a url
        setPageLink({
          editor,
          suggestion: query,
        })
      }
    }
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      window.requestAnimationFrame(() => {
        if (!pendingSetContent.current) {
          setPage()
        }
      })
    }
  })

  if (!pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={pagesRes} />
  }

  if (!suggestions && pagesRes.data) {
    setSuggestions(Object.values(pagesRes.data))
  }

  const onPageSelected = (page: Page) => {
    setPage(page)

    dismiss()
  }

  const Suggestion = () => {
    // check if query is url
    const _regex = new RegExp(validUriRegex, 'gi')
    const isAtomicIdUrl = _regex.test(query)

    return isAtomicIdUrl ? (
      <Text variant="uiTextSmall" color="gray.3" display="inline">
        press enter
      </Text>
    ) : (
      <View overflowX="hidden" overflowY="auto" maxHeight={pxUnits(menuHeight)}>
        {filteredSuggestions.length ? (
          filteredSuggestions.map((s: Page) => (
            // eslint-disable-next-line react/jsx-indent
            <DropdownListItem
              label={s.name}
              key={s._id}
              onPress={() => onPageSelected(s)}
            />
          ))
        ) : (
          <Text variant="uiTextSmall" color="gray.3" display="inline">
            no pages found
          </Text>
        )}
      </View>
    )
  }

  return (
    <View>
      {filteredSuggestions.length && query?.length ? (
        Suggestion()
      ) : (
        <>
          <Text variant="uiTextSmall" color="gray.3" display="inline" p="tiny">
            {!query?.length ? 'enter a page title or URL' : Suggestion()}
          </Text>
        </>
      )}
    </View>
  )
}

export default SuggestLinks

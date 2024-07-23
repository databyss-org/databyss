import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Editor } from '@databyss-org/slate'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { debounce } from 'lodash'
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
import { useOpenGraph } from '../../../databyss-data/pouchdb/hooks/useOpenGraph'
import { useEditorContext } from '../../state/EditorProvider'

const removePrefixFromTitle = (title: string) => {
  const _substring = title.substr(0, 10)
  if (_substring === 'web page: ') {
    return title.substr(10)
  }
  return title
}

const SuggestLinks = ({ query, onSuggestionsChanged, menuHeight, dismiss }) => {
  const { setContent } = useEditorContext()
  const editor = useEditor() as ReactEditor & Editor
  // const embedRes = useBlocksInPages(BlockType.Embed)
  const pagesRes = usePages({ previousIfNull: true })
  const [isUrl, setIsUrl] = useState(false)
  const [title, setTitle] = useState<null | string>(null)
  const pendingSetContent = useRef(false)

  const [suggestions, setSuggestions] = useState<null | Page[]>(null)
  const filteredSuggestionLengthRef = useRef(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Page[]>([])

  const [debounceQuery, setDebounceQuery] = useState('')

  // debounce the query search
  const queryChange = useCallback(
    debounce((q: string) => {
      setDebounceQuery(q)
    }, 1500),
    []
  )

  useEffect(() => {
    queryChange(query)
  }, [query])

  const graphRes = useOpenGraph(debounceQuery)

  useEffect(() => {
    if (graphRes?.data?.title?.length) {
      setTitle(graphRes?.data?.title)
    }
  }, [graphRes?.data])

  useEffect(() => {
    const _regex = new RegExp(validUriRegex, 'gi')
    const isAtomicIdUrl = _regex.test(query)
    setIsUrl(isAtomicIdUrl)
  }, [query])

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
          .slice(0, 20)
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
        setContent,
        isPage: true,
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
          setContent,
          isPage: true,
        })
      } else {
        // assume page link is a url
        const _suggestion = title
          ? { _id: query, name: removePrefixFromTitle(title) }
          : query
        setPageLink({
          editor,
          suggestion: _suggestion,
          setContent,
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

  const Suggestion = () =>
    isUrl ? (
      <Text variant="uiTextSmall" color="gray.3" display="inline">
        {`press enter${title ? `: ${title}` : ''}`}
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

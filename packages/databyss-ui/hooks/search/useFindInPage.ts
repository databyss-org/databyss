import colors from '@databyss-org/ui/theming/colors'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { EventEmitter } from 'events'
import { useNavigationContext } from '../../components'

export class HighlightManager {
  private _highlightElements: Element[]
  private _eventEmitter: EventEmitter

  constructor() {
    this._highlightElements = []
    this._eventEmitter = new EventEmitter()
  }

  private debouncedDispatch = debounce(() => {
    this._eventEmitter.emit('elementsChanged')
  }, 500)

  get highlightElements() {
    return this._highlightElements
  }

  set highlightElements(value: Element[]) {
    this._highlightElements = value
    this.debouncedDispatch()
  }

  resetHighlightElements() {
    this._highlightElements = []
  }

  addHighlightElement(value: Element) {
    this._highlightElements.push(value)
    this.debouncedDispatch()
  }

  addListener(cb) {
    this._eventEmitter.on('elementsChanged', cb)
  }

  removeListener(cb) {
    this._eventEmitter.off('elementsChanged', cb)
  }
}

export const highlightManager = new HighlightManager()

export interface FindInPageMatch {
  element: Element
}

export interface FindInPage {
  matches: FindInPageMatch[]
  currentIndex: number
  runQuery: () => void
  findNext: () => void
  findPrev: () => void
}

export interface UseFindInPageOptions {
  onMatchesUpdated?: (matches: FindInPageMatch[]) => void
}

export const useFindInPage = (options?: UseFindInPageOptions): FindInPage => {
  const [matches, setMatches] = useState<FindInPageMatch[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const location = useNavigationContext((c) => c && c.location)

  const deactivateMatch = (index: number) => {
    if (index < 0 || index > matches.length - 1) {
      return
    }
    const { orange } = colors
    const _matchElement = matches[index].element
    _matchElement.setAttribute('style', `background-color: ${orange[3]};`)
  }

  const activateMatch = (index: number) => {
    if (index < 0 || index > matches.length - 1) {
      return
    }
    const { orange } = colors
    const _matchElement = matches[index].element
    _matchElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    _matchElement.setAttribute('style', `background-color: ${orange[2]};`)
  }

  const queryHighlights = () => {
    const _matches: FindInPageMatch[] = []
    document
      .querySelectorAll(`[data-find-highlight="true"]`)
      .forEach((element) => {
        _matches.push({ element })
      })
    return _matches
  }

  const runQuery = () => {
    setMatches(queryHighlights())
  }

  const findNext = () => {
    let _nextIndex = currentIndex + 1
    if (_nextIndex > matches.length - 1) {
      _nextIndex = 0
    }
    deactivateMatch(currentIndex)
    // activateMatch(_nextIndex)
    setCurrentIndex(_nextIndex)
  }

  const findPrev = () => {
    let _prevIndex = currentIndex - 1
    if (_prevIndex < 0) {
      _prevIndex = matches.length - 1
    }
    deactivateMatch(currentIndex)
    // activateMatch(_prevIndex)
    setCurrentIndex(_prevIndex)
  }

  useEffect(() => {
    setCurrentIndex(0)
    activateMatch(0)
    if (options?.onMatchesUpdated) {
      options.onMatchesUpdated(matches)
    }
  }, [matches])

  useEffect(() => {
    // console.log('[useFindInPage] currentIndex changed, update focus')
    activateMatch(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    // console.log('[useFindInPage] location changed, reset highlightManager')
    highlightManager.resetHighlightElements()
    runQuery()
  }, [location])

  const resetQuery = useCallback(() => {
    const _matches = queryHighlights()
    if (_matches.length !== matches.length) {
      runQuery()
    }
  }, [queryHighlights, runQuery])

  useEffect(() => {
    highlightManager.addListener(resetQuery)
    return () => {
      highlightManager.removeListener(resetQuery)
    }
  }, [])

  return {
    runQuery,
    findNext,
    findPrev,
    matches,
    currentIndex,
  }
}

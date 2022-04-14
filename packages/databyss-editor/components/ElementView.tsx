import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { View } from '@databyss-org/ui'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import { useNavigationContext } from '@databyss-org/ui/components'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
import { Block } from '../interfaces'
import { isAtomicClosure } from './AtomicHeader'

interface ElementViewProps extends PropsWithChildren<{}> {
  block: Block | null
  previousBlock: Block | null
  isBlock?: boolean
  readOnly: boolean
  index: number
}

export const ElementView = ({
  children,
  isBlock,
  block,
  previousBlock,
  readOnly,
  index,
  ...others
}: ElementViewProps) => {
  const getTokensFromPath = useNavigationContext((c) => c.getTokensFromPath)
  const setFocusIndex = useEditorPageContext((c) => c && c.setFocusIndex)
  const { anchor } = getTokensFromPath()
  const viewRef = useRef(null)

  useEffect(() => {
    if (!anchor) {
      return
    }
    if (!viewRef.current) {
      return
    }
    if (parseInt(anchor, 10) !== index) {
      return
    }
    setFocusIndex(index)
  }, [viewRef.current, anchor])

  return (
    <View
      name={index}
      ref={viewRef}
      ml={isBlock && !(readOnly && isMobile()) ? 'medium' : 0}
      mr="large"
      pt={
        block?.type === 'ENTRY' || block?.type === previousBlock?.type ? 1 : 3
      }
      pb="em"
      display={isBlock ? 'flex' : 'inline-flex'}
      widthVariant="content"
      position="relative"
      justifyContent="center"
      {...(isAtomicClosure(previousBlock?.type) && {
        pt: '4',
      })}
      {...(isAtomicClosure(block?.type) && {
        borderBottomWidth: '2px',
        borderBottomColor: 'gray.5',
        pb: 'small',
        mr: 'largest',
      })}
      {...others}
    >
      {children}
    </View>
  )
}

ElementView.defaultProps = {
  isBlock: true,
}

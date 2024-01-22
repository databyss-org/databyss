import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { View } from '@databyss-org/ui'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import { Block } from '../interfaces'
import { isAtomicClosure } from './AtomicHeader'

interface ElementViewProps extends PropsWithChildren<{}> {
  block: Block | null
  previousBlock: Block | null
  isBlock?: boolean
  readOnly: boolean
  index: number
  last: boolean,
  setLastBlockRendered: () => void
}

export const ElementView = ({
  children,
  isBlock,
  block,
  previousBlock,
  readOnly,
  index,
  last,
  setLastBlockRendered,
  ...others
}: ElementViewProps) => {
  // // const { anchor } = getTokensFromPath()
  const viewRef = useRef(null)

  useEffect(() => {
    if (viewRef.current && last) {
      setLastBlockRendered()
    }
  }, [viewRef.current])

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

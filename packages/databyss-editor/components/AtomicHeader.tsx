import { urlSafeName } from '@databyss-org/services/lib/util'
import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import { BaseControl, Text } from '@databyss-org/ui'
import { useNavigationContext } from '@databyss-org/ui/components'
import React, { PropsWithChildren } from 'react'
import { Block, BlockType } from '../interfaces'

export const getAtomicStyle = (type) =>
  ({
    SOURCE: 'bodyHeading3Underline',
    TOPIC: 'bodyHeading2',
    END_TOPIC: 'uiTextSmall',
    END_SOURCE: 'uiTextSmall',
  }[type])

export const isAtomicClosure = (type) =>
  ({
    END_TOPIC: true,
    END_SOURCE: true,
  }[type])

export interface AtomicHeaderProps {
  block: Block
  readOnly: boolean
  selHasRange?: boolean
}

export const AtomicHeader = ({
  children,
  block,
  readOnly,
  selHasRange,
}: PropsWithChildren<AtomicHeaderProps>) => {
  const navigate = useNavigationContext((c) => c && c.navigate)

  const _groupId = getAccountFromLocation(true)
  const _blockPath = {
    [BlockType.Source]: 'sources',
    [BlockType.EndSource]: 'sources',
    [BlockType.Topic]: 'topics',
    [BlockType.EndTopic]: 'topics',
  }[block.type]
  const _href = `/${_groupId}/${_blockPath}/${block._id}/${urlSafeName(
    block.text.textValue
  )}`

  const onAtomicMouseDown = (e) => {
    e.preventDefault()
    navigate(_href)
  }

  return (
    <BaseControl
      alignSelf="flex-start"
      flexWrap="nowrap"
      display="inline"
      alignItems="center"
      borderRadius="default"
      data-test-atomic-edit="open"
      pl="tiny"
      pr={!isAtomicClosure(block.type) ? '0' : 'tiny'}
      ml="tinyNegative"
      backgroundColor={
        !readOnly && block.__isActive ? 'background.3' : 'transparent'
      }
      css={{
        cursor: !readOnly && selHasRange ? 'text' : 'pointer',
        caretColor: block.__isActive ? 'transparent' : 'currentcolor',
      }}
      onPress={onAtomicMouseDown}
      href={_href}
    >
      <Text
        variant={getAtomicStyle(block.type)}
        color={`${isAtomicClosure(block.type) ? 'gray.4' : ''}`}
        display="inline"
      >
        {children}
      </Text>
    </BaseControl>
  )
}

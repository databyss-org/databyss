import React, { ReactNode, Ref } from 'react'
import { Embed } from '@databyss-org/services/interfaces/Block'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'

export const InlineEmbed = ({
  embedData,
  attributes,
  onClick,
  children,
  _children,
  textRef,
}: {
  embedData: Embed | null | undefined
  attributes: any
  children: ReactNode
  onClick: () => void
  _children: any
  textRef: Ref<any>
}) => (
  <span
    {...attributes}
    onClick={onClick}
    aria-hidden="true"
    style={{
      width: '100%',
      position: 'relative',
      display: 'inline-block',
      ...(embedData
        ? {}
        : {
            height: '350px',
          }),
      // borderRadius: '3px',
      //    padding: '3px',
    }}
  >
    <span
      contentEditable={false}
      id="inline-embed"
      style={{
        position: 'relative',
        zIndex: 1,
      }}
    >
      {embedData ? children : <LoadingFallback />}
    </span>
    <span
      ref={textRef}
      style={{
        padding: '8px',
        zIndex: 0,
        position: 'absolute',
        left: 0,
        top: 0,
      }}
    >
      {_children}
    </span>
  </span>
)

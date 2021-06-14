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
      // minWidth: '50%',
      // maxWidth: '480px',
      width: '100%',
      position: 'relative',
      display: 'inline-block',
      // borderRadius: '3px',
      //    padding: '3px',
    }}
  >
    <span
      contentEditable={false}
      id="inline-embed"
      style={{
        position: 'relative',
        // TODO: change  this back to a high number
        zIndex: 1,
        // display: 'inline-block',
      }}
    >
      {embedData ? children : <LoadingFallback />}
    </span>
    <span
      ref={textRef}
      style={{
        padding: '8px',
        // todo: change this back  to zero
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

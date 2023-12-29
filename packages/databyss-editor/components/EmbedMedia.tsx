import React, { useEffect, useState, useRef } from 'react'
import {
  useSelected,
  useFocused,
  useSlate,
  ReactEditor,
} from '@databyss-org/slate-react'
import { Node, Editor as SlateEditor, Transforms } from '@databyss-org/slate'
import { Button, Icon, View } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/search.svg'
import { Embed, Block } from '@databyss-org/services/interfaces/Block'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { InlineEmbed } from './InlineEmbed'
import { ResolveEmbed } from './ResolveEmbed'

export const isHttpInsecure = (url) => {
  const _regEx = /^http:\/\//
  return _regEx.test(url)
}

export const EmbedMedia = ({
  _children,
  attributes,
  _element,
  onInlineClick,
  editor,
}) => {
  const blockRes = useDocument<Block>(_element.atomicId)
  const [highlight, setHighlight] = useState(false)
  const textRef = useRef<any>()
  const _isSelected = useSelected()

  // console.log('[EmbedMedia] blockRes.data', blockRes.data)

  // only compute if current block is focused
  const _isFocused = useFocused()
  // check if embed should have anoutline
  useEffect(() => {
    if (!_isSelected && highlight) {
      setHighlight(false)
      return
    }
    if (_isSelected && _isFocused && editor?.selection) {
      // get current leaf value
      const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
      if (_currentLeaf.embed && !highlight) {
        setHighlight(true)
      } else if (highlight && !_currentLeaf.embed) {
        setHighlight(false)
      }
    }
  }, [editor?.selection, _isSelected, _isFocused])

  const highlightEmbed = () => {
    try {
      const _el = textRef.current?.children?.[0]
      const _node = ReactEditor.toSlateNode(editor, _el)
      const _path = ReactEditor.findPath(editor, _node)
      const _offset = _node.text.length
      const _point = { path: _path, offset: _offset }
      Transforms.select(editor, _point)
    } catch {
      console.log('unable to select')
    }
  }

  return (
    <InlineEmbed
      attributes={attributes}
      embedData={blockRes.data as Embed}
      onClick={highlightEmbed}
      _children={_children}
      textRef={textRef}
    >
      <View position="relative">
        <ResolveEmbed
          data={blockRes.data as Embed}
          highlight={highlight}
          position="relative"
          zIndex={1}
        />
        {highlight && (
          <View
            zIndex={2}
            position="absolute"
            top="em"
            right="em"
            backgroundColor="gray.6"
          >
            <Button
              variant="editSource"
              onPress={() =>
                onInlineClick({ atomicType: 'EMBED', id: _element.atomicId })
              }
            >
              <Icon sizeVariant="small" color="background.5">
                <PenSVG />
              </Icon>
            </Button>
          </View>
        )}
      </View>
    </InlineEmbed>
  )
}

export const EditorEmbedMedia = (props) => {
  const editor = useSlate() as ReactEditor & SlateEditor
  return <EmbedMedia {...props} editor={editor} />
}

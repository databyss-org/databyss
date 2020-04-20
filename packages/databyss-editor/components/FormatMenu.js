import React from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import { useEditor } from 'slate-react'
import { Transforms, Text as SlateText, Editor } from 'slate'
import { isMobileOs } from '@databyss-org/ui/'
import { pxUnits } from '@databyss-org/ui/theming/views'
import HoveringToolbar from './HoveringToolbar'
import { isFormatActive, toggleMark } from './../lib/slateUtils'

const mobileActions = [
  {
    type: 'SOURCE',
    label: '+ source',
    variant: 'uiTextNormal',
  },
  {
    type: 'TOPIC',
    label: '+ topic',
    variant: 'uiTextNormal',
  },
  {
    type: 'LOCATION',
    label: '+ location',
    variant: 'uiTextNormal',
  },
]

const desktopActions = [
  {
    type: 'location',
    label: 'loc',
    variant: 'uiTextNormal',
  },
]

const formatActions = isMobileNewLine => [
  ...(isMobileOs() && isMobileNewLine ? mobileActions : desktopActions),
  {
    type: 'DIVIDER',
  },
  {
    type: 'bold',
    label: 'b',
    variant: 'uiTextNormalSemibold',
  },
  {
    type: 'italic',
    label: 'i',
    variant: 'uiTextNormalItalic',
  },
]

const formatActionButtons = () =>
  // placeholder for mobile actions
  true
    ? formatActions(true).reduce((acc, a, i) => {
        if (a.type === 'DIVIDER') {
          return acc.concat(
            <View
              key={i}
              borderRightColor="border.1"
              borderRightWidth={pxUnits(1)}
              marginLeft="extraSmall"
              marginRight="extraSmall"
            />
          )
        }
        return acc.concat(
          <MarkButton
            key={i}
            index={i}
            type={a.type}
            label={a.label}
            variant={a.variant}
          />
        )
      }, [])
    : []

const MarkButton = ({ type, label, variant, ...others }) => {
  const editor = useEditor()
  const isActive = isFormatActive(editor, type)

  // const isFormatActive = (editor, format) => {
  //   const [match] = Editor.nodes(editor, {
  //     match: n => n[format] === true,
  //     mode: 'all',
  //   })
  //   return !!match
  // }

  const toggleFormat = format => {
    // const isActive = isFormatActive(editor, format)
    // console.log(Editor.fragment(editor, editor.selection))
    // console.log(isActive)
    // Transforms.setNodes(
    //   editor,
    //   { [format]: isActive ? null : true },
    //   { match: Text.isText, split: true }
    // )

    toggleMark(editor, format)
    // Transforms.setNodes(
    //   editor,
    //   {
    //     [format]: isActive ? null : true,
    //   },
    //   {
    //     match: SlateText.isText,
    //     //  at: editor.selection,
    //     split: true,
    //   }
    // )
  }

  const actions = type =>
    ({
      bold: () => toggleFormat(type),
      italic: () => toggleFormat(type),
      location: () => toggleFormat(type),
    }[type])

  return (
    <Button
      data-test-format-menu={type}
      variant="formatButton"
      onMouseDown={e => {
        e.preventDefault()
        actions(type)()
      }}
      {...others}
    >
      <Text
        variant={variant}
        pr="extraSmall"
        pl="extraSmall"
        color={isActive ? 'primary.1' : 'text.1'}
      >
        {label}
      </Text>
    </Button>
  )
}

const FormatMenu = () => (
  <HoveringToolbar>{formatActionButtons()}</HoveringToolbar>
)

export default FormatMenu

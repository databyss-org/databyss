import React from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import { isMobileOs } from '@databyss-org/ui/'
import { pxUnits } from '@databyss-org/ui/theming/views'
import EditorTooltip from '../EditorTooltip'
import { useEditorContext } from '../EditorProvider'
import { toggleMark, startTag } from '../state/actions'

const mobileActions = [
  {
    type: 'SOURCE',
    label: '+ source',
    variant: 'uiTextNormal',
    action: a => startTag(a),
  },
  {
    type: 'TOPIC',
    label: '+ topic',
    variant: 'uiTextNormal',
    action: a => startTag(a),
  },
  {
    type: 'LOCATION',
    label: '+ location',
    variant: 'uiTextNormal',
    action: a => startTag(a),
  },
]

const desktopActions = [
  {
    type: 'location',
    label: 'loc',
    variant: 'uiTextNormal',
    action: a => toggleMark(a),
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
    action: a => toggleMark(a),
  },
  {
    type: 'italic',
    label: 'i',
    variant: 'uiTextNormalItalic',
    action: a => toggleMark(a),
  },
]

const formatActionButtons = editor =>
  formatActions(!editor.value.anchorBlock.text.length).reduce((acc, a, i) => {
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
        editor={editor}
        index={i}
        type={a.type}
        label={a.label}
        variant={a.variant}
        action={a.action}
      />
    )
  }, [])

const MarkButton = ({ editor, type, label, variant, action, ...others }) => {
  const [, dispatchEditor] = useEditorContext()
  const { value } = editor
  const isActive = value.activeMarks.some(mark => mark.type === type)

  return (
    <Button
      data-test-format-menu={type}
      variant="formatButton"
      onMouseDown={e => {
        e.preventDefault()
        dispatchEditor(action(type, { value }))
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

const HoverMenu = ({ editor }) => (
  <EditorTooltip editor={editor}>{formatActionButtons(editor)}</EditorTooltip>
)

export default HoverMenu

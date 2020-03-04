import React, { useEffect, useState } from 'react'
import buttons, {
  editorMarginMenuItemHeight,
} from '@databyss-org/ui/theming/buttons'
import { View, Button, Icon, Grid } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import AddSvg from '@databyss-org/ui/assets/add.svg'

const BlockMenuActions = ({ menuActionButtons, unmount }) => {
  useEffect(() => () => unmount(), [])
  return (
    <Grid singleRow columnGap="tiny">
      {menuActionButtons}
    </Grid>
  )
}

const BlockMenu = ({ showButton }) => {
  const [showMenuActions, setShowMenuActions] = useState(false)

  const { buttonVariants } = buttons

  const onShowActions = () => {
    setShowMenuActions(!showMenuActions)
    console.log('show actions')
  }

  const onMenuAction = tag => {
    // issue with https://www.notion.so/databyss/Demo-error-7-If-you-click-location-and-press-return-it-doesn-t-move-the-cursor-but-it-makes-everyth-9eaa6b3f02c04358b42f00159863a355
    console.log('click on', tag)
    setShowMenuActions(false)
  }

  const menuActions = [
    {
      action: 'SOURCE',
      label: '@ source',
    },
    {
      action: 'TOPIC',
      label: '# topic',
    },
    {
      action: 'LOCATION',
      label: 'location',
    },
  ]

  const menuActionButtons = menuActions.map((a, i) => (
    <Button
      variant="editorMarginMenuItem"
      data-test-block-menu={a.action}
      key={i}
      onMouseDown={e => onMenuAction(a.action, e)}
    >
      {a.label}
    </Button>
  ))

  return showButton ? (
    <Grid singleRow columnGap="small">
      <View
        height={editorMarginMenuItemHeight}
        width={editorMarginMenuItemHeight}
        justifyContent="center"
      >
        <Button
          variant="editorMarginMenu"
          onClick={onShowActions}
          data-test-block-menu="open"
        >
          <Icon
            sizeVariant="tiny"
            color={buttonVariants.editorMarginMenu.color}
          >
            <View>{showMenuActions ? <Close /> : <AddSvg />}</View>
          </Icon>
        </Button>
      </View>
      <View justifyContent="center" height={editorMarginMenuItemHeight}>
        {showMenuActions && (
          <BlockMenuActions
            unmount={
              () => null
              //   dispatchEditor(onShowMenuActions(false, editableState))
            }
            menuActionButtons={menuActionButtons}
          />
        )}
      </View>
    </Grid>
  ) : null
}

export default BlockMenu

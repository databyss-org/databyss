import effects from './effects'
import { border, borderRadius, pxUnits } from './views'
import space from './space'

export const editorMarginMenuItemHeight = 24

const button = () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: space.medium,
  paddingRight: space.medium,
  paddingTop: space.small,
  paddingBottom: space.small,
  marginTop: pxUnits(1),
  borderRadius,
  ...effects.buttonShadow,
})

const linkButton = () => ({
  textDecoration: 'underline',
  paddingLeft: space.small,
  paddingRight: space.small,
  paddingTop: space.small,
  paddingBottom: space.small,
})

const buttonVariants = {
  primaryUi: {
    ...button(),
    backgroundColor: 'primary.0',
    color: 'primary.3',
  },
  secondaryUi: {
    ...button(),
    ...border(1, 'secondary.0'),
    backgroundColor: 'background.0',
    color: 'secondary.3',
  },
  uiLink: {
    ...linkButton(),
    color: 'secondary.3',
  },
  editorMarginMenu: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'background.1',
    borderColor: 'background.2',
    borderWidth: pxUnits(1),
    color: 'text.4',
    borderRadius: pxUnits(editorMarginMenuItemHeight),
    width: pxUnits(editorMarginMenuItemHeight),
    height: pxUnits(editorMarginMenuItemHeight),
  },

  editorMarginMenuItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: space.small,
    paddingRight: space.small,
    paddingTop: editorMarginMenuItemHeight / 2,
    paddingBottom: editorMarginMenuItemHeight / 2,
    borderRadius: pxUnits(5),
    height: pxUnits(editorMarginMenuItemHeight),
    color: 'text.4',
    backgroundColor: 'background.2',
  },
  formatButton: {
    backgroundColor: 'background.6',
    borderRadius: pxUnits(0),
    borderRightWidth: pxUnits(1),
  },
}

const buttonThemes = {
  primaryUi: {
    rippleColor: 'primary.2',
    hoverColor: 'primary.1',
    activeColor: 'primary.2',
  },
  secondaryUi: {
    rippleColor: 'secondary.2',
    hoverColor: 'secondary.1',
    activeColor: 'secondary.2',
  },
  primaryExternal: {},
  secondaryExternal: {},
  uiLink: {},
  externalLink: {},
  editorMarginMenuItem: {
    rippleColor: 'background.2',
    hoverColor: 'background.4',
    activeColor: 'background.1',
    textProps: {
      variant: 'uiTextSmall',
    },
  },
  editorMarginMenu: {
    rippleColor: 'primary.2',
    hoverColor: 'background.4',
    activeColor: 'primary.2',
  },
  formatButton: {
    textProps: {},
    rippleColor: 'primary.2',
    hoverColor: 'background.6',
    activeColor: 'primary.2',
  },
}

// make toolbar button component
// make button component inline-grid
// use our custom grid component
// use single row variant for grid
// take out sources and topics from menu
// on mobile it will show plus topic and location instead of plus
//

export default {
  buttonVariants,
  buttonThemes,
}

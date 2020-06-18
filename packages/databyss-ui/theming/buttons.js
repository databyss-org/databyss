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

const textButton = () => ({
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
  googleSignIn: {
    ...button(),
    ...border(1, 'gray.5'),
    backgroundColor: '#ffffff',
    color: 'gray.3',
  },
  uiTextButton: {
    ...textButton(),
    color: 'secondary.3',
  },
  uiLink: {
    padding: space.none,
    color: 'secondary.3',
    textDecoration: 'underline',
  },
  editorMarginMenu: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: pxUnits(1),
    color: 'text.2',
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
    color: 'text.2',
  },
  formatButton: {
    paddingBottom: pxUnits(6),
    paddingTop: pxUnits(6),
    borderRadius: pxUnits(0),
  },
  editSource: {
    display: 'inline-block',
    padding: 'extraSmall',
  },
}

const buttonThemes = {
  primaryUi: {
    hoverColor: 'primary.1',
    activeColor: 'primary.2',
  },
  secondaryUi: {
    hoverColor: 'secondary.1',
    activeColor: 'secondary.2',
  },
  googleSignIn: {
    hoverColor: 'secondary.1',
    activeColor: 'secondary.2',
  },
  primaryExternal: {},
  secondaryExternal: {},
  uiLink: {
    hoverColor: 'background.1',
    activeColor: 'background.2',
  },
  uiTextButton: {
    hoverColor: 'background.1',
    activeColor: 'background.2',
  },
  externalLink: {},
  editorMarginMenuItem: {
    hoverColor: 'background.4',
    activeColor: 'background.1',
    textProps: {
      variant: 'uiTextSmall',
    },
  },
  editorMarginMenu: {
    hoverColor: 'control.1',
    activeColor: 'primary.2',
  },
  formatButton: {
    textProps: {},
    hoverColor: 'background.1',
    activeColor: 'background.2',
  },
  editSource: {
    textProps: {},
    hoverColor: 'background.3',
    activeColor: 'background.4',
  },
}

// on mobile it will show plus topic and location instead of plus
//

export default {
  buttonVariants,
  buttonThemes,
}

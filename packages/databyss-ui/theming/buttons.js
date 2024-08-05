import effects from './effects'
import { border, borderRadius, pxUnits } from './views'
import space from './space'

export const menuLauncherSize = 26

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
    ...border(1, 'gray.5'),
    backgroundColor: '#ffffff',
    color: 'gray.3',
  },
  pinkHighlighted: {
    ...button(),
    backgroundColor: 'purple.1',
    color: 'text.6',
  },
  uiTextButton: {
    ...textButton(),
    color: 'secondary.3',
  },
  uiTextButtonShaded: {
    py: 'tiny',
    px: 'small',
    borderRadius,
    backgroundColor: 'gray.6',
  },
  uiTextButtonOutlined: {
    py: 'tiny',
    px: 'small',
    borderRadius,
    ...border(1, 'text.3'),
  },
  uiLink: {
    padding: space.none,
    textDecoration: 'underline',
  },
  formatButton: {
    paddingBottom: pxUnits(6),
    paddingTop: pxUnits(6),
    borderRadius: pxUnits(0),
  },
  editSource: {
    display: 'inline-block',
    padding: `${pxUnits(space.tiny)} ${pxUnits(space.extraSmall)}`,
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
  pinkHighlighted: {
    hoverColor: 'purple.2',
    activeColor: 'purple.0',
  },
  primaryExternal: {},
  secondaryExternal: {},
  uiLink: {
    hoverColor: 'background.1',
    activeColor: 'background.2',
    textProps: {
      color: 'blue.2',
    },
  },
  uiTextButton: {
    hoverColor: 'background.1',
    activeColor: 'background.2',
  },
  uiTextButtonShaded: {
    hoverColor: 'gray.5',
    pressedColor: 'gray.4',
  },
  uiTextButtonOutlined: {
    hoverColor: 'background.1',
    pressedColor: 'background.2',
  },
  externalLink: {},
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

buttonVariants.uiLinkPadded = {
  ...buttonVariants.uiLink,
  padding: 'tiny',
  borderRadius,
}

buttonThemes.uiLinkPadded = buttonThemes.uiLink

// on mobile it will show plus topic and location instead of plus
//

export default {
  buttonVariants,
  buttonThemes,
}

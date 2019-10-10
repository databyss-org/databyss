import effects from './effects'
import { border, borderRadius, pxUnits } from './views'
import space from './space'

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
}

export default {
  buttonVariants,
  buttonThemes,
}

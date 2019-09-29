import effects from './effects'
import colors from './colors'
import { border, borderRadius } from './views'
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
  marginTop: '1px',
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
    backgroundColor: colors.primary[0],
    color: colors.white,
  },
  secondaryUi: {
    ...button(),
    ...border(1, colors.border[0]),
    backgroundColor: colors.transparent,
    color: colors.black,
  },
  uiLink: {
    ...linkButton(),
    color: colors.primary[0],
  },
}

const buttonThemes = {
  primaryUi: {
    rippleColor: colors.primary[2],
    hoverColor: colors.primary[1],
    activeColor: colors.primary[2],
  },
  secondaryUi: {
    rippleColor: colors.secondary[2],
    hoverColor: colors.secondary[1],
    activeColor: colors.secondary[2],
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

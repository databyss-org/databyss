import effects from './effects'
import { border, borderRadius, pxUnits } from './views'
import space from './space'
import colors from './colors'

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

const menuButton = () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: space.small,
  paddingRight: space.small,
  paddingTop: space.tiny,
  paddingBottom: space.tiny,
  borderRadius: pxUnits(5),
})

const sidebarButton = () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: space.small,
  height: '10px',
  // paddingLeft: space.small,
  // paddingRight: space.small,
  // paddingTop: space.tiny,
  // paddingBottom: space.tiny,
  borderRadius: '50%',
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
  sidebarAction: {
    ...sidebarButton(),
    backgroundColor: 'background.3',
    // TODO: this doesnt get evaluated
    //  borderColor: 'border.3',

    borderColor: 'grey',
    borderWidth: '1px',
    color: 'text.4',
  },
  menuAction: {
    ...menuButton(),
    color: 'text.4',
    backgroundColor: 'background.4',
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
  menuAction: {
    rippleColor: 'secondary.2',
    hoverColor: 'secondary.1',
    activeColor: 'secondary.4',
  },
  sidebarAction: {
    rippleColor: 'primary.2',
    hoverColor: 'primary.1',
    activeColor: 'primary.2',
  },
}

export default {
  buttonVariants,
  buttonThemes,
}

// import Color from 'color'
// import { Platform } from 'react-native'
// import colors from './colors'
// import { border, pxUnits } from './views'
// import space from './space'

// const button = () => ({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   paddingLeft: space.medium,
//   paddingRight: space.medium,
//   paddingTop: space.small,
//   paddingBottom: space.small,
//   borderRadius: pxUnits(5),
//   ...Platform.select({
//     ios: {},
//     android: {},
//     default: {
//       '& > div': {
//         zIndex: 1,
//       },
//     },
//   }),
// })

// const menuButton = () => ({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   paddingLeft: space.small,
//   paddingRight: space.small,
//   paddingTop: space.tiny,
//   paddingBottom: space.tiny,
//   borderRadius: pxUnits(5),
//   ...Platform.select({
//     ios: {},
//     android: {},
//     default: {
//       '& > div': {
//         zIndex: 1,
//       },
//     },
//   }),
// })

// const sidebarButton = () => ({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   paddingLeft: space.small,
//   paddingRight: space.small,
//   paddingTop: space.tiny,
//   paddingBottom: space.tiny,
//   borderRadius: '50%',
//   ...Platform.select({
//     ios: {},
//     android: {},
//     default: {
//       '& > div': {
//         zIndex: 1,
//       },
//     },
//   }),
// })

// const linkButton = () => ({
//   textDecoration: 'underline',
//   paddingLeft: space.tiny,
//   paddingRight: space.tiny,
//   paddingTop: space.tiny,
//   paddingBottom: space.tiny,
// })

// const buttonVariants = {
//   primaryUi: {
//     ...button(),
//     ...border(1, colors.blue[1]),
//     backgroundColor: colors.blue[1],
//     rippleColor: Color(colors.blue[0])
//       .darken(0.5)
//       .string(),
//     color: colors.white,
//   },
//   secondaryUi: {
//     ...button(),
//     ...border(1, colors.black),
//     backgroundColor: colors.transparent,
//     color: colors.black,
//   },
//   primaryExternal: {
//     ...button(),
//     ...border(1, colors.orange[0]),
//     backgroundColor: Color(colors.orange[0])
//       .alpha(0.2)
//       .rgb()
//       .string(),
//     color: colors.orange[0],
//     rippleColor: colors.orange[0],
//   },
//   secondaryExternal: {
//     ...button(),
//     ...border(1, colors.gray[2]),
//     backgroundColor: 'transparent',
//     color: colors.black,
//   },
//   uiLink: {
//     ...linkButton(),
//     color: colors.blue[1],
//   },
//   externalLink: {
//     ...linkButton(),
//     color: colors.orange[0],
//   },
//   primaryExternal: {},
//   secondaryExternal: {},
//   uiLink: {},
//   externalLink: {},
//   menuAction: {
//     ...menuButton(),
//     backgroundColor: colors.gray[8],
//     color: colors.gray[9],
//   },
//   sidebarAction: {
//     ...sidebarButton(),
//     backgroundColor: colors.gray[7],
//     borderColor: colors.gray[5],
//     borderWidth: '1px',
//     color: colors.gray[4],
//   },
// }

// export default {
//   buttonVariants,
// }

// TODO: confirm if require or import?
const {
  ViewHeaderHeight,
} = require('@databyss-org/ui/primitives/Mobile/ViewHeader')
const { NavBarHeight } = require('../components/NavBar')

export const getScrollViewMaxHeight = () =>
  window.innerHeight - ViewHeaderHeight - NavBarHeight

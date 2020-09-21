// TODO: confirm if require or import?
const { ViewHeaderHeight } = require('../modules/Mobile/ViewHeader')
const { NavBarHeight } = require('../components/NavBar')

export const getScrollViewMaxHeight = () =>
  window.innerHeight - ViewHeaderHeight - NavBarHeight

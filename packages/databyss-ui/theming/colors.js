import Color from 'color'

// raw colors [dark...light]
let _c = {
  gray: [
    '#221F1B',
    '#2F2E2D',
    '#3B3835',
    '#504d49',
    '#958d83',
    '#D0CDC8',
    '#e3e1de',
    '#F0F0F0',
  ],
  black: '#12100C',
  white: '#FDFDFC',
  blue: ['#4444BC', '#6C6CE0', '#7D7DE8', '#B6B6FB'],
  purple: ['#591749', '#932A79', '#DD3CB4', '#C695D0', '#DADAE4', '#E3E3E9'],
  red: ['#FF4343', '#B82F00', '#A86A68'],
  green: ['#7AB814', '#749440'],
  orange: ['#B82E00', '#E55E1A', '#EB9947', '#F7C96E'],
  transparent: 'rgba(0,0,0,0)',
}

// named color aliases
_c = {
  ..._c,
  pink: _c.purple[1],
  yellow: _c.orange[3],
  highlight: [
    Color(_c.orange[1]).desaturate(0.3).alpha(0.4).rgb().string(),
    Color(_c.orange[3]).alpha(0.8).rgb().string(),
  ],
}

// system colors
_c = {
  ..._c,
  // [darkest...lightest]
  text: [_c.black, ..._c.gray.slice(2)],
  // [lightest...darkest]
  background: [_c.gray[7], ..._c.gray.slice().reverse()],
  // control colors [enabled, hover, active, label]
  primary: [_c.blue[1], _c.blue[2], _c.blue[0], _c.white],
  secondary: [_c.blue[1], _c.gray[6], _c.gray[5], _c.blue[1]],
  // BaseControl colors [enabled, hover, pressed]
  control: [_c.transparent].concat(
    [_c.gray[4], _c.gray[5]].map((c) => Color(c).alpha(0.4).rgb().string())
  ),
  // borders [darkest...lightest]
  border: [_c.black, _c.gray[3], _c.gray[5], _c.gray[6]],
  // application specific
  selectionHighlight: Color(_c.blue[3]).alpha(0.5).rgb().string(),
  activeTextInputBackground: _c.white,
  pageBackground: 'transparent',
  scrollShadow: '#bbb',
  inlineSource: '#cc6633',
  inlineTopic: '#B82F00',
  modalShadow: '#000000',
  searchBackground: '#F0F0F0',
  sidebarSearchBorder: _c.gray[6],
}

// legacy (deprecated)
_c = {
  ..._c,
  focusOutlineColor: _c.pink,
  entrySourceColor: _c.purple[0],
}

// light ui mode
const _lightUi = {
  ..._c,
  background: [..._c.gray.slice().reverse()],
  text: [_c.black, ..._c.gray.slice(2)],
}

// dark mode
const _darkUi = {
  ..._c,
  // [lightest...darkest]
  text: [_c.white, ..._c.gray.slice().reverse().slice(1)],
  // [darkest...lightest]
  background: _c.gray.slice(1),
  // borders [darkest...lightest]
  border: [_c.gray[7], _c.gray[5], _c.gray[3], _c.gray[3]],
  // control colors [enabled, hover, active, label]
  secondary: [_c.blue[1], _c.gray[2], _c.gray[0], _c.blue[2]],
  activeTextInputBackground: _c.black,
  pageBackground: 'transparent',
  // BaseControl colors [enabled, hover, pressed]
  control: [_c.transparent].concat(
    [_c.gray[4], _c.gray[3]].map((c) => Color(c).alpha(0.4).rgb().string())
  ),
  scrollShadow: '#222',
  modalShadow: '#999',
  highlight: [
    Color(_c.blue[3]).lightness(80).alpha(0.4).rgb().string(),
    Color(_c.orange[2]).lightness(60).saturate(1).alpha(0.4).rgb().string(),
  ],
  searchBackground: '#1f1f1f',
  sidebarSearchBorder: 'transparent',
}
const _darkContent = {
  ..._darkUi,
  background: ['#1f1f1f', '#292929', _c.gray[2], _c.gray[3], _c.gray[4]],
  text: [_c.gray[7], _c.gray[6], _c.gray[5], _c.gray[4]],
  inlineSource: '#ff9100',
  inlineTopic: Color(_c.inlineTopic).lighten(0.8).hex(),
  purple: _c.purple.map((c) => Color(c).lighten(0.9).hex()),
  blue: _c.blue.map((c) => Color(c).saturate(0.5).lighten(0.2).hex()),
  // orange: _c.orange.map((c) => Color(c).darken(0.8).blacken(0.8).hex()),
}
_c = {
  ..._c,
  modes: {
    dark: _darkUi,
    darkContent: _darkContent,
    light: _lightUi,
    lightContent: _c,
  },
}

const colors = _c

export default colors

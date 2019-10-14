import Color from 'color'

// raw colors [dark...light]
let _c = {
  gray: [
    '#221F1B',
    '#353331',
    '#4A4845',
    '#847B71',
    '#AAA49C',
    '#D0CDC8',
    '#ECEBE9',
    '#FAFAFA',
  ],
  black: '#12100C',
  white: '#FDFDFC',
  blue: ['#4444BC', '#6C6CE0', '#7D7DE8', '#B6B6FB'],
  purple: ['#591749', '#932A79', '#C70095', '#C695D0'],
  red: ['#FF4343'],
  green: ['#7AB814'],
  orange: ['#B82E00', '#E55E1A', '#EB9947', '#F7C96E'],
  transparent: 'rgba(0,0,0,0)',
}

// named color aliases
_c = {
  ..._c,
  pink: _c.purple[1],
  yellow: _c.orange[3],
}

// system colors
_c = {
  ..._c,
  // [darkest...lightest]
  text: [_c.black, ..._c.gray],
  // [lightest...darkest]
  background: [_c.white, ..._c.gray.slice().reverse()],
  // control colors [enabled, hover, active, label]
  primary: [_c.blue[1], _c.blue[2], _c.blue[0], _c.white],
  secondary: [_c.blue[1], _c.gray[6], _c.gray[5], _c.blue[1]],
  // borders [darkest...lightest]
  border: [_c.black, _c.gray[5]],
  // application specific
  selectionHighlight: Color(_c.blue[3])
    .alpha(0.5)
    .rgb()
    .string(),
}

// legacy (deprecated)
_c = {
  ..._c,
  focusOutlineColor: _c.pink,
  entrySourceColor: _c.purple[0],
}

// dark mode
_c = {
  ..._c,
  modes: {
    dark: {
      // [darkest...lightest]
      text: [_c.white, ..._c.gray.slice().reverse()],
      // [lightest...darkest]
      background: _c.gray,
      // borders [darkest...lightest]
      border: [_c.gray[7], _c.gray[3]],
      // control colors [enabled, hover, active, label]
      secondary: [_c.blue[1], _c.gray[2], _c.gray[1], _c.blue[2]],
    },
  },
}

const colors = _c

export default colors

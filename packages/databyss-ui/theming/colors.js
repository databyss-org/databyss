const colors = {
  blues: ['#0F2A8A', '#1944DD', '#4770FF', '#99C2FF'],
  purples: ['#67349B', '#D745B6'],
  red: '#FF4343',
  green: '#7AB814',
  oranges: ['#B84D00', '#FF9900', '#FF9900'],
  browns: ['#D39365', '#E1B797', '#EFDACA'],
  yellow: '#FFE766',
  black: '#000',
  white: '#fff',
  greys: [
    '#181510',
    '#312A21',
    '#4D4842',
    '#C4C4C4',
    '#AAA49C',
    '#D0CDC8',
    '#ECEBE9',
    '#FAFAFA',
  ],
  pink: '#d745b6',
  lightPurple: '#675d71',
}

colors.darkBackground = colors.greys[0]
colors.lightBackground = colors.greys[1]
colors.darkText = colors.black
colors.inverseText = colors.white
colors.darkTexts = [colors.black, colors.greys[0]]
colors.focusOutlineColor = colors.pink
colors.entrySourceColor = colors.lightPurple

export default { colors }

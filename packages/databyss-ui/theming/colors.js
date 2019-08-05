const colors = {
  gray: [
    '#181510',
    '#312A21',
    '#4D4842',
    '#847B71',
    '#AAA49C',
    '#D0CDC8',
    '#ECEBE9',
    '#FAFAFA',
  ],
  black: '#12100C',
  white: '#FDFDFC',
  blue: ['#0F2A8A', '#1944DD', '#4770FF', '#99C2FF'],
  purple: ['#67349B', '#D745B6'],
  red: ['#FF4343'],
  green: ['#7AB814'],
  orange: ['#B84D00', '#FF9900', '#FFC000', '#FFE766'],
  transparent: 'rgba(0,0,0,0)',
}

colors.darkBackground = colors.gray[0]
colors.lightBackground = colors.gray[1]
colors.pink = colors.purple[1]
colors.yellow = colors.orange[3]
colors.darkText = colors.black
colors.inverseText = colors.white
colors.darkTexts = [colors.black, colors.gray[0]]
colors.focusOutlineColor = colors.pink
colors.entrySourceColor = colors.purple[0]

export default colors

const colors = {
  black: '#000',
  white: '#fff',
  greys: ['#4a4a4a', '#807d79', '#d1cdc7', '#f2efeb', '#a19f9c'],
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

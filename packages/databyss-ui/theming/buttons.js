const button = size => ({
  textVariant: `uiText${size}`,
})

const buttonVariants = {
  primaryUi: {
    primary: colors.blue[1],
    hover: colors.blue[2],
    pressed: colors.blue[0],
    borderColor: colors.blue[2],
    fontColor: colors.white,
  },
  secondary: {
    primary: colors.white,
    hover: colors.gray[6],
    pressed: colors.gray[5],
    borderColor: colors.black,
    fontColor: colors.black,
  },
  external: {
    primary: colors.orange[2],
    hover: colors.orange[1],
    pressed: colors.orange[0],
    borderColor: colors.orange[0],
    fontColor: colors.orange[0],
  },
  link: {
    primary: colors.clear,
    hover: colors.gray[6],
    pressed: colors.orange[5],
    borderColor: colors.clear,
    fontColor: colors.blue[1],
  },

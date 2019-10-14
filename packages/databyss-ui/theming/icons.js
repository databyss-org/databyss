const icon = size => ({
  width: size,
  height: size,
})

const iconSizeVariants = {
  extraTiny: {
    ...icon(8),
  },
  tiny: {
    ...icon(14),
  },
  small: {
    ...icon(22),
  },
  medium: {
    ...icon(32),
  },
  large: {
    ...icon(50),
  },
}

export default {
  iconSizeVariants,
}

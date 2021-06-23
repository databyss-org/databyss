const icon = (size) => ({
  width: size,
  height: size,
})

export const iconSizeVariants = {
  extraTiny: {
    ...icon(8),
  },
  tiny: {
    ...icon(14),
  },
  small: {
    ...icon(20),
  },
  medium: {
    ...icon(26),
  },
  large: {
    ...icon(32),
  },
  extraLarge: {
    ...icon(64),
  },
  title: {
    width: 108,
    height: 24,
  },
}

export default {
  iconSizeVariants,
}

const space = [0, 8, 16, 24, 32, 64, 128]

space.none = space[0]
space.small = space[1]
space.em = space[2]
space.medium = space[3]
space.large = space[4]
space.extraLarge = space[5]
space.largest = space[6]
space.tiny = 3.0
space.extraSmall = 5.0

space.tinyNegative = space.tiny * -1
space.smallNegative = space.small * -1
space.emNegative = space.em * -1
space.mediumNegative = space.medium * -1
space.largeNegative = space.large * -1

export default space

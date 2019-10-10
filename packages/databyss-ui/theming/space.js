import { pxUnits } from '@databyss-org/ui/theming/views'

const space = [0, 8, 16, 24, 32, 64]

space.none = space[0]
space.small = space[1]
space.medium = space[3]
space.menuHeight = space[4]
space.large = space[5]
space.tiny = pxUnits(11)

space.smallNegative = space.small * -1
space.mediumNegative = space.medium * -1
space.largeNegative = space.large * -1

export default space

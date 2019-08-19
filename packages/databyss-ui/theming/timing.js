const timing = [75, 300, 500, 1000, 3000]

timing.slow = timing[3]
timing.medium = timing[2]
timing.quick = timing[1]
timing.flash = timing[0]
timing.ease = 'ease-in-out'
timing.touchDecay = timing.medium

export default timing

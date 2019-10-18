const timing = [100, 300, 500, 1000, 1500, 10000]

timing.debug = timing[5]
timing.slow = timing[3]
timing.medium = timing[2]
timing.quick = timing[1]
timing.flash = timing[0]
timing.ease = 'ease-in-out'
timing.easeOut = 'cubic-bezier(0.09, 0.4, 0, 0.9)'
timing.touchDecay = timing.medium

export default timing

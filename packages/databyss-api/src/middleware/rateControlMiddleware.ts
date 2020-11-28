import ExpressSlowDown from 'express-slow-down'
import RedisStore from 'rate-limit-redis'
import { Express, Request } from 'express'
import Redis from 'ioredis'

// how long to keep records of requests in memor
const WINDOW_MS = 60 * 1000
const MAX_DELAY_MS = 60 * 1000

export const createRateController = (app: Express) =>
  new Promise((resolve) => {
    console.log('[rate control] starting...')
    try {
      // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
      // see https://expressjs.com/en/guide/behind-proxies.html
      app.set('trust proxy', 1)

      const keyGenerator = (tag: string) => (req: Request) => {
        const key = `${tag}:${req.ip}`
        return key
      }

      let redisClient: Redis.Redis
      if (process.env.NODE_ENV === 'production') {
        redisClient = new Redis(process.env.REDISCLOUD_URL!, {
          lazyConnect: true,
          reconnectOnError: () => false,
          maxRetriesPerRequest: null,
        })
      }

      const MemoryStore = require('express-slow-down/lib/memory-store')

      // limit successful requests (status < 400) to 10 req / min / IP
      const successLimiterConfig = {
        windowMs: WINDOW_MS,
        delayAfter: 10,
        delayMs: 50,
        maxDelayMs: MAX_DELAY_MS,
        skipFailedRequests: true,
        keyGenerator: keyGenerator('S'),
        store: new MemoryStore(WINDOW_MS),
      }

      // limit failed requests (status >= 400) to 1 req / min / IP
      const failedLimiterConfig = {
        windowMs: WINDOW_MS,
        delayAfter: 1,
        delayMs: 1000,
        maxDelayMs: MAX_DELAY_MS,
        skipSuccessfulRequests: true,
        keyGenerator: keyGenerator('F'),
        store: new MemoryStore(WINDOW_MS),
      }

      redisClient = new Redis(process.env.REDISCLOUD_URL!, {
        lazyConnect: true,
      })
      console.log('[rate control] ⏳ REDIS connecting...')
      redisClient
        .connect()
        .then(() => {
          const redisStore = new RedisStore({
            client: redisClient,
          })
          successLimiterConfig.store = redisStore
          failedLimiterConfig.store = redisStore
          resolve([
            ExpressSlowDown(successLimiterConfig),
            ExpressSlowDown(failedLimiterConfig),
          ])
        })
        .catch((err) => {
          console.error('[rate control] 🔴 REDIS error', err)
          redisClient.disconnect()
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[rate control] 👎 falling back to memory store in development env'
            )
            resolve([
              ExpressSlowDown(successLimiterConfig),
              ExpressSlowDown(failedLimiterConfig),
            ])
          } else {
            resolve(null)
          }
        })
    } catch (err) {
      console.error('[rate control] 🔴 error', err)
      resolve(null)
    }
  })

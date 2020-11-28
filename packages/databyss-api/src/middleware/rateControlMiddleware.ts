import ExpressSlowDown from 'express-slow-down'
import RedisStore from 'rate-limit-redis'
import { Express, Request } from 'express'
import MurmurHash3 from 'imurmurhash'

// how long to keep records of requests in memor
const WINDOW_MS = 60 * 1000

export const createRateController = (app: Express) => {
  // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // see https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', 1)

  const keyGenerator = (tag: string) => (req: Request) => {
    const requestHash = MurmurHash3(
      JSON.stringify([req.rawHeaders, req.method, req.url, req.body])
    ).result()
    const key = `${tag}:${req.ip}:${requestHash}`
    return key
  }

  const MemoryStore = require('express-slow-down/lib/memory-store')
  const store =
    process.env.NODE_ENV === 'production'
      ? new RedisStore({
          redisURL: process.env.REDIS_URL,
        })
      : new MemoryStore(WINDOW_MS)

  // limit successful requests (status < 400) to 10 req / min / IP
  const successLimiterConfig = {
    windowMs: WINDOW_MS,
    delayAfter: 10,
    delayMs: 50,
    skipFailedRequests: true,
    keyGenerator: keyGenerator('S'),
    store,
  }

  // limit failed requests (status >= 400) to 1 req / min / IP
  const failedLimiterConfig = {
    windowMs: WINDOW_MS,
    delayAfter: 1,
    delayMs: 1000,
    skipSuccessfulRequests: true,
    keyGenerator: keyGenerator('F'),
    store,
  }

  return [
    ExpressSlowDown(successLimiterConfig),
    ExpressSlowDown(failedLimiterConfig),
  ]
}

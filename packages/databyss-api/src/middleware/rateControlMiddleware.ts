import ExpressSlowDown from 'express-slow-down'
import RedisStore from 'rate-limit-redis'
import { Express, Request } from 'express'
import redis from 'redis'
import { Redis } from 'ioredis'

// how long to keep records of requests in memor
const WINDOW_MS = 60 * 1000
const MAX_DELAY_MS = 60 * 1000

const getReditHostAndPort = (uri: string): Partial<redis.ClientOpts> => {
  const _parts = uri.split(':')
  return {
    port: parseInt(_parts[_parts.length - 1], 10),
    host: _parts.slice(0, _parts.length - 1).join(':'),
  }
}

export const createRateController = (app: Express) => {
  // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // see https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', 1)

  const keyGenerator = (tag: string) => (req: Request) => {
    const key = `${tag}:${req.ip}`
    return key
  }

  const MemoryStore = require('express-slow-down/lib/memory-store')
  const store =
    process.env.NODE_ENV === 'production'
      ? new RedisStore({
          client: redis.createClient({
            ...getReditHostAndPort(process.env.REDIS_URL!),
            tls: { checkServerIdentity: () => undefined },
          }),
        })
      : new MemoryStore(WINDOW_MS)

  // limit successful requests (status < 400) to 10 req / min / IP
  const successLimiterConfig = {
    windowMs: WINDOW_MS,
    delayAfter: 10,
    delayMs: 50,
    maxDelayMs: MAX_DELAY_MS,
    skipFailedRequests: true,
    keyGenerator: keyGenerator('S'),
    store,
  }

  // limit failed requests (status >= 400) to 1 req / min / IP
  const failedLimiterConfig = {
    windowMs: WINDOW_MS,
    delayAfter: 1,
    delayMs: 1000,
    maxDelayMs: MAX_DELAY_MS,
    skipSuccessfulRequests: true,
    keyGenerator: keyGenerator('F'),
    store,
  }

  return [
    ExpressSlowDown(successLimiterConfig),
    ExpressSlowDown(failedLimiterConfig),
  ]
}

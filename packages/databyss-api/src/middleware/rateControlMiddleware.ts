import ExpressSlowDown from 'express-slow-down'
import RedisStore from 'rate-limit-redis'
import { Express, Request } from 'express'
import MurmurHash3 from 'imurmurhash'

export const createRateController = (app: Express) => {
  // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // see https://expressjs.com/en/guide/behind-proxies.html
  app.enable('trust proxy')

  // add success bit to keygen
  const keyGenerator = (tag: string) => (req: Request) => {
    const requestHash = MurmurHash3(
      JSON.stringify([req.rawHeaders, req.method, req.url, req.body])
    ).result()
    const key = `${tag}:${req.ip}:${requestHash}`
    console.log(key)
    return key
  }

  const MemoryStore = require('express-slow-down/lib/memory-store')
  const store =
    // process.env.NODE_ENV === 'production'
    //   ? new RedisStore({
    //       redisURL: process.env.REDIS_URL,
    //     })
    //   : // MemoryStore(windowMs) # how long to keep records of requests in memory
    new MemoryStore(60 * 1000)

  // limit successful requests (status < 400) to 10 req / sec / IP
  const successLimiterConfig = {
    windowMs: 1000,
    delayAfter: 10,
    delayMs: 50,
    skipFailedRequests: true,
    keyGenerator: keyGenerator('S'),
    store,
  }

  // limit failed requests (status >= 400) to 1 req / sec / IP
  const failedLimiterConfig = {
    windowMs: 1000,
    delayAfter: 1,
    delayMs: 1000,
    skipSuccessfulRequests: true,
    keyGenerator: keyGenerator('F'),
    store,
  }

  // store to REDIS on production environments
  if (process.env.NODE_ENV === 'production') {
    const _store = new RedisStore({
      redisURL: process.env.REDIS_URL,
    })
    failedLimiterConfig.store = _store
    successLimiterConfig.store = _store
  }

  return [
    ExpressSlowDown(successLimiterConfig),
    ExpressSlowDown(failedLimiterConfig),
  ]
}

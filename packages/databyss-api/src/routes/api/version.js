import express from 'express'
import { version } from '../../../package.json'

const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).send(version)
})

export default router

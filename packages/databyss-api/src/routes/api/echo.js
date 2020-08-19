import express from 'express'
import echo from '@databyss-org/services/echo'

const router = express.Router()

router.get('/:msg', (req, res) => {
  res.status(200).send(echo(req.params.msg))
})

export default router

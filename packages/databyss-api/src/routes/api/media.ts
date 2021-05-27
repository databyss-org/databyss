import express from 'express'
import ogs from 'open-graph-scraper'

const router = express.Router()

interface OpenGraph {
  type: string | null
  title: string | null
}

// @route    GET api/media/opengraph
// @desc     removes page from shared database
// @access   private
router.post('/opengraph', async (req, res) => {
  const _url = req.body.url
  const options = { url: _url }
  const _data = await ogs(options)
  const { result } = _data

  const _response: OpenGraph = {
    type: null,
    title: null,
  }

  if (result.success) {
    // check if youtube link
    if (result.ogSiteName === 'YouTube') {
      _response.type = 'youtube'
      _response.title = result.ogTitle
    }
  }

  return res.status(200).json(_response).send()
})

export default router

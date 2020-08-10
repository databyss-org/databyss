import express from 'express'
import multipart from 'connect-multiparty'

import { ApiError } from '@databyss-org/api/src/lib/Errors'
import wrap from '@databyss-org/api/src/lib/guardedAsync'

import { parse } from '../../services/annotations-parser'

import deleteFileAt from '../../utils/delete-file-at'
import getTimeSince from '../../utils/get-time-since'

const router = express.Router()
const multipartMiddleware = multipart()

// @route    POST api/pdf/parse
// @desc     Takes a PDF file and parses it's annotations
// @access   Private
router.post(
  '/',
  multipartMiddleware,
  wrap(async (req, res) => {
    // get pdf from uploaded files
    const { pdf } = req.files
    console.log(`📑 Parsing "${pdf.originalFilename}" from ${pdf.path}...`)

    try {
      const parsedData = await parse(pdf.path)

      // clean up uploaded file
      await deleteFileAt(pdf.path)

      const duration = getTimeSince(parsedData.startTime)

      const message = `🎉 Parsed annotations successfully! (${duration}ms)`
      console.log(message)

      // respond with data
      const jsonResponse = {
        message,
        numAnnotations: parsedData.annotations.length,
        annotations: parsedData.annotations,
      }
      return res.json(jsonResponse)
    } catch (error) {
      console.log('❌ Failed to parse annotations:', error)

      // clean up uploaded file
      await deleteFileAt(pdf.path)

      // respond with error
      throw new ApiError('Failed to parse annotations', 401)
    }
  })
)

export default router

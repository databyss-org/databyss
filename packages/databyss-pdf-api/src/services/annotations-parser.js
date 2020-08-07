/* eslint no-use-before-define: ["error", { "functions": false }] */
/* eslint-disable prefer-promise-reject-errors */

const chromium = require('chrome-aws-lambda')
const signals = require('signals')
const path = require('path')

const pdfjsParser = require('./pdfjs-parser')

// constants
const annotationsTypes = ['Text', 'Highlight', 'Underline', 'Stamp']
const protocol = 'file://'
const viewURL = `${protocol}${__dirname}/../../view/index.html`

// methods definitions
export const parse = async docPath => {
  // ensure to add protocol to temp path for uploaded file
  const pdfPath = `${protocol}${docPath}`

  // calculate parsing duration
  const startTime = new Date().getTime()

  // 1st pass: modified pdfjs to get source text
  let firstPass
  try {
    firstPass = await parse1stPass(pdfPath)
    console.log(`✅ 1st pass completed`)
  } catch (error) {
    return Promise.reject(`First pass has failed: ${error.message}`)
  }

  // 2nd pass: normal pdfjs to get all popup contents
  let secondPass
  try {
    secondPass = await parse2ndPass(pdfPath)
    console.log(`✅ 2nd pass completed`)
  } catch (error) {
    return Promise.reject(`Second pass has failed: ${error.message}`)
  }

  // return parsed data
  return Promise.resolve({
    annotations: mergeAnnotations(firstPass, secondPass),
    startTime,
  })
}

async function parse1stPass(pdfPath) {
  // create signal emitter for exposed function to be able to sent its data
  const firstPassObtained = new signals.Signal()

  // prepare promise to return
  const promise = new Promise((resolve, reject) => {
    // handle signal of completion
    const onFirstPassComplete = response => {
      // response structure:
      // {
      //   success <boolean>
      //   message <string>
      //   data <array>
      // }
      if (response.success) {
        resolve(response.data)
      } else {
        reject(response.message)
      }
    }

    // listen to signal
    firstPassObtained.add(onFirstPassComplete)
  })

  let executablePath = process.env.CHROMIUM_BIN
  if (executablePath) {
    executablePath = path.resolve(
      __dirname,
      `./bin/.local-chromium/${executablePath}`
    )
    console.log(`Chromium executable: ${executablePath}`)
  }

  // init headless browser (puppeteer)
  const browser = await chromium.puppeteer.launch({
    ...(executablePath
      ? {
          executablePath,
        }
      : {}),

    // necessary so local files can be loaded
    args: ['--disable-web-security', '--no-sandbox'],

    defaultViewport: chromium.defaultViewport,
    headless: true,
  })
  console.log('✅ Created headless browser...')

  // create web page
  const page = await browser.newPage()
  console.log('✅ Created page...')

  // show view console logs in node console
  page.on('console', msg => {
    /* eslint-disable no-plusplus */
    for (let i = 0; i < msg.args().length; ++i) {
      console.log(`${i}: ${msg.args()[i]}`)
    }
    /* eslint-enable no-plusplus */
  })
  console.log('✅ Added console log listeners...')

  // set function for view to call upon completion of parsing.
  // response is sent by JS running inside of HTML view.
  await page.exposeFunction(
    'resolveForPuppeteer', // method name called by view
    firstPassObtained.dispatch, // method called once method above is called
    [firstPassObtained] // dependencies
  )
  console.log('✅ Exposed function for view to use...')

  // load page
  console.log(`🔍 Fetching first pass of annotations`)
  console.log(`⏳ Loading view from "${viewURL}"...`)
  await page.goto(viewURL, { waitUntil: 'networkidle0' })

  // evaluate arg must be a template string to avoid babel rewriting async
  // https://github.com/puppeteer/puppeteer/issues/1665#issuecomment-354241717
  await page.evaluate(
    `(async () => {
      console.log('⏳ Waiting for view to load PDF from "${pdfPath}"...')
      await window.loadPDF('${pdfPath}')
    })()`
  )
  console.log('✅ Triggered view to load PDF...')

  await browser.close()

  return promise
}

async function parse2ndPass(path) {
  console.log(`🔍 Fetching second pass of annotations`)

  // Annotations obtained from modified pdfjs are incomplete:
  // modification is opiniated and does not provide popup/stamps content.
  // Go through a second pass to obtain those texts,
  // then merge them with obtained annotations in first pass.

  return pdfjsParser.parse(path)
}

/**
 * @param {array} annotations1 Annotations obtained from the modified PDFJS.
 * @param {array} annotations2 Annotations obtained from parsing with unmodified PDFJS.
 */
function mergeAnnotations(annotations1, annotations2) {
  if (!annotations1) {
    throw new ReferenceError(
      'Method expects the annotations obtained in the first pass of parsing.'
    )
  }
  if (!annotations2) {
    throw new ReferenceError(
      'Method expects the annotations obtained in the second pass of parsing.'
    )
  }

  console.log('📑 Merging annotations')

  /* eslint-disable no-param-reassign */
  annotations1 = annotations1.filter(a => annotationsTypes.includes(a.type))
  annotations2 = annotations2.filter(a => annotationsTypes.includes(a.type))
  /* eslint-enable no-param-reassign */

  if (annotations1.length !== annotations2.length) {
    console.warn(
      '⚠️ The two arrays do not have the same amount of annotations.'
    )
  }

  const response = []

  annotations1.forEach(annotation => {
    const newAnnotation = Object.assign({}, annotation)

    const filtered = annotations2.filter(
      b =>
        // raw id contains text, whereas id from modified annotation parser is only number
        // to match, ensure mod. annot. id is contained in raw id
        b.id.indexOf(annotation.id) > -1
    )

    if (filtered.length) {
      // array.filter provides an array, there should be only one match
      const other = filtered[0]

      if (other.contents) {
        newAnnotation.contents = other.contents
      }
      if (other.author) {
        newAnnotation.author = other.author
      }
    }

    response.push(newAnnotation)
  })

  console.log('📑 Number of annotations:', response.length)

  return response
}

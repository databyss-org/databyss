/* eslint no-use-before-define: ["error", { "functions": false }] */

console.log('✅ main.js loaded')

window.eapi.pdf.onLoadInView((pdfPath) => {
  console.log('[PDF] main onLoadInView', pdfPath)
  loadPDF(pdfPath)
})

// Method is called by Puppeteer in packages/databyss-pdf-api/src/services/annotations-parser.js
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function loadPDF(path) {
  console.log(`⏳ Loading PDF from ${path}`)

  // ensure to return promise
  // so that puppeteer can wait for resolution
  getAnnotations(path)
    .then(data => {
      eapi.pdf.resolvePass1({
        success: true,
        path,
        data,
        message: 'Successfully parsed annotations',
      })
    })
    .catch(error => {
      eapi.pdf.resolvePass1({
        success: true,
        path,
        data: null,
        message: error.message,
      })
    })
}

function getAnnotations(path) {
  console.log(`⏳ Getting annotations from ${path}`)

  // load file via modified version of pdfjs
  // which gets pages and extracts annotations and text
  return new Promise((resolve, reject) => {
    /* eslint-disable no-undef */
    // PDFJS is defined globally by the JS import in index.html
    PDFJS.getPDFAnnotations(path)
      .then(data => resolve(prepareResponse(data.annotations)))
      .catch(reject)
  })
}

function prepareResponse(annotations) {
  const numAnnotations =
    annotations && annotations.length ? annotations.length : 0
  console.log(`📦 Preparing response (${numAnnotations} anotations)`)

  const response = []
  annotations.forEach(data => {
    response.push({
      id: data.id,
      page: data.page,
      type: data.subtype,
      sourceText: data.markup,
    })
  })
  return response
}

function resolve(response) {
  console.log(`📡 Sending response to headless browser`)

  try {
    /* eslint-disable no-undef */
    // Method is defined in packages/databyss-pdf-api/src/services/annotations-parser.js
    resolveForPuppeteer(response)
    /* eslint-enable no-undef */
  } catch (error) {
    console.warn(
      '❌ Unable to resolve for headless browser, script must be running in actual browser.'
    )
  }
}

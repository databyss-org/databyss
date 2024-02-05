/* eslint no-use-before-define: ["error", { "functions": false }] */

const pdfjs = require('pdfjs-dist/es5/build/pdf.js')
const he = require('he')
const fs = require('fs')
const path = require('path')

let numPages = 0
let metadata = {}
let allPagesData = []

if (PDFVIEW_WINDOW_WEBPACK_ENTRY.includes('http:')) {
  pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('./.webpack/renderer/pdfview_window/lib/pdf.worker.js')
} else {
  const _staticsDir = PDFVIEW_WINDOW_WEBPACK_ENTRY.replace('index.html', '').replace('file://', '')
  pdfjs.GlobalWorkerOptions.workerSrc = path.join(_staticsDir, 'lib', 'pdf.worker.js')
}
console.log(pdfjs.GlobalWorkerOptions.workerSrc)

// utils
function stripOfHTML(source) {
  const striped = source.replace(/<[^>]+>/g, '')
  return he.decode(striped)
}

async function getPageText(pageData) {
  let render_options = {
    //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
    normalizeWhitespace: false,
    //do not attempt to combine same line TextItem's. The default value is `false`.
    disableCombineTextItems: false
  }

  const textContent = await pageData.getTextContent(render_options)
  // console.log('[PDF] text', textContent)


  let lastY, text = ''
  const lines = []
  //https://github.com/mozilla/pdf.js/issues/8963
  //https://github.com/mozilla/pdf.js/issues/2140
  //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
  //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
  for (let item of textContent.items) {
    if (lastY == item.transform[5] || !lastY){
      text += item.str
    } else {
      lines.push(text)
      text = item.str
    }    
    lastY = item.transform[5]
    // lines.push(item)
  }
  lines.push(text)
  return lines
}

// public api
export async function parse(path) {
  let pdf

  try {
    pdf = await loadPDF(path)
  } catch (error) {
    return Promise.reject(error)
  }

  numPages = pdf.numPages

  try {
    await getMetadata(pdf)
  } catch (error) {
    return Promise.reject(error)
  }

  try {
    await getAllPages(pdf)
  } catch (error) {
    return Promise.reject(error)
  }

  try {
    await getAllAnnotations()
  } catch (error) {
    return Promise.reject(error)
  }

  try {
    await getAllPageText()
  } catch (error) {
    return Promise.reject(error)
  }

  return Promise.resolve(prepareResponse())
}

// private methods
function loadPDF(path) {
  return new Promise((resolve, reject) => {
    const loadingTask = pdfjs.getDocument(path)
    loadingTask.promise.then((pdf) => resolve(pdf)).catch(reject)
  })
}

function getMetadata(pdf) {
  return new Promise((resolve, reject) => {
    pdf
      .getMetadata()
      .then((data) => {
        metadata = {}
        if (data.info.Author) {
          metadata.author = data.info.Author
        }
        if (data.info.Title) {
          metadata.title = {
            src: data.info.Title,
            text: stripOfHTML(data.info.Title),
          }
        }
        resolve(metadata)
      })
      .catch(reject)
  })
}

function getAllPages(pdf) {
  allPagesData.length = 0
  allPagesData = []

  return new Promise((resolve, reject) => {
    const allPromises = []
    /* eslint-disable no-plusplus */
    for (let i = 0; i < numPages; i++) {
      const pageNumber = i + 1 // note: pages are 1-based
      /* eslint-disable no-loop-func */
      const page = pdf
        .getPage(pageNumber)
        .then((pageContent) => {
          allPagesData.push({
            data: pageContent,
            pageNumber: pageContent.pageNumber,
          })
        })
        .catch(reject)
      /* eslint-enable no-loop-func */
      allPromises.push(page)
    }
    /* eslint-enable no-plusplus */
    Promise.all(allPromises)
      .then(() => {
        allPagesData.sort(sortByPageNumber)
        resolve(allPagesData)
      })
      .catch(reject)
  })
}

function getAllPageText() {
  return new Promise((resolve, reject) => {
    const allPromises = []
    allPagesData.forEach((page) => {
      const textPromise = getPageText(page.data)
        .then((pageLines) => {
          page.textLines = pageLines
        })
        .catch(reject)
      allPromises.push(textPromise)
    })
    Promise.all(allPromises)
      .then(() => resolve(allPagesData))
      .catch(reject)
  })
} 

function getAllAnnotations() {
  return new Promise((resolve, reject) => {
    const allPromises = []
    allPagesData.forEach((page) => {
      const { data } = page
      const annotationPromise = data
        .getAnnotations('print')
        .then((annotations) => {
          page.numAnnotations = annotations.length
          page.annotations = []
          if (page.numAnnotations) {
            annotations.forEach((annotation) => {
              page.annotations.push(parseAnnotation(annotation))
            })
          }
        })
        .catch(reject)
      allPromises.push(annotationPromise)
    })
    Promise.all(allPromises)
      .then(() => resolve(allPagesData))
      .catch(reject)
  })
}

function parseAnnotation(data) {
  const response = {
    data,
    id: data.id,
    type: data.subtype,
    author: data.title,
    contents: data.contents,
  }

  if (data.parentId) {
    response.parentId = data.parentId
  }

  return response
}

function getFirstNonEmptyLine(textLines: string[]) {
  for (const text of textLines) {
    if (text.trim().length > 0) {
      return text
    }
  }
}

function findDoi(textLines: string[]) {
  for (const text of textLines) {
    const matches = text.match(/doi\.org\/(.+)\s?/)
    if (matches) {
      return matches[1]
    }
  }
}

function prepareResponse() {
  const allAnnotations = []

  // get annotations from page data
  allPagesData.forEach((pageData) => {
    allAnnotations.push(...pageData.annotations)
  })

  // clone to ensure not to touch raw data
  const annotations = allAnnotations.slice()
  annotations.forEach((annotation) => {
    // remove superfluous property
    delete annotation.data
  })

  metadata.extractedTitle = getFirstNonEmptyLine(allPagesData[0].textLines)
  metadata.extractedDOI = findDoi(allPagesData[0].textLines)

  // console.log('[PDF] metadata', metadata)

  return { metadata, annotations }
}

function sortByPageNumber(a, b) {
  if (a.pageNumber < b.pageNumber) {
    return -1
  }
  if (a.pageNumber > b.pageNumber) {
    return 1
  }
  return 0
}

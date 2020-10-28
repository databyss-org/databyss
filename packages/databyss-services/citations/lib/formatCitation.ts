import Cite from 'citation-js'

import {
  CitationOutputTypes,
  CitationStyleIds,
  CitationStyles,
} from '../constants'

// consts
const Styles = [
  {
    id: CitationStyleIds.APA,
    data: null,
  },
  {
    id: CitationStyleIds.CHICAGO,
    data: null,
  },
  {
    id: CitationStyleIds.HARVARD,
    data: null,
  },
  {
    id: CitationStyleIds.IEEE,
    data: null,
  },
  {
    id: CitationStyleIds.MLA,
    data: null,
  },
  {
    id: CitationStyleIds.VANCOUVER,
    data: null,
  },
]

// vars
let cite = null

/**
 * @param {object} csl An object formatted following the CSL-JSON schema.
 * See the <a href="https://citeproc-js.readthedocs.io/en/latest/csl-json/markup.html">CSL-JSON documentation</a>.
 * @param {object} options (optional) An object with the formatting options:
 * - `outputType`: Either "bibliography" or "citation". Defaults to "bibliography".
 * - `styleId`: The citation style identifier. Defaults to "mla".
 */
export async function formatCitation(csl, options) {
  const outputType =
    options && options.outputType
      ? options.outputType
      : CitationOutputTypes.BIBLIOGRAPHY

  const styleId =
    options && options.styleId ? options.styleId : CitationStyleIds.MLA

  // error checks
  if (!csl) {
    throw new Error('formatCitation() expected a CSL JSON as first parameter.')
  }
  if (
    outputType !== CitationOutputTypes.BIBLIOGRAPHY &&
    outputType !== CitationOutputTypes.CITATION
  ) {
    throw new Error(
      'formatCitation() expected `options.outputType` ' +
        `to either be "${CitationOutputTypes.BIBLIOGRAPHY}", ` +
        `or "${CitationOutputTypes.CITATION}". ` +
        `Received "${outputType}". `
    )
  }
  if (typeof styleId !== 'string') {
    throw new Error(
      'formatCitation() expected `options.styleId` to be a string.'
    )
  }
  const style = CitationStyles.find(
    s => s.id.toLowerCase() === styleId.toLowerCase()
  )
  if (!style) {
    throw new Error(
      'formatCitation() encountered an unhandled value for the `styleId` parameter: ' +
        `"${styleId}". ` +
        'Look at `citation-styles.js` for accepted style IDs.'
    )
  }

  return new Promise((resolve, reject) => {
    try {
      // cache to avoid fetching at every call
      let styleData = ''
      if (!hasStyle(styleId)) {
        // 📡 no style data, must fetch it
        styleData = Cite.util.fetchFile(style.url)
        addStyle(styleId, styleData)
      } else {
        // ✅ style data already saved
        styleData = getStyle(styleId)
      }

      const styleConfig = Cite.plugins.config.get('@csl')

      if (!hasConfig(styleId, styleConfig)) {
        // 📡 missing config, must fetch it
        styleConfig.templates.add(styleId, styleData)
      }

      if (!cite) {
        cite = new Cite(csl)
      } else {
        cite = cite.reset()
        cite.set(csl)
      }

      const citation = cite.format(outputType, {
        format: 'html',
        template: styleId,
      })

      resolve(citation)
    } catch (error) {
      reject(error)
    }
  })
}

// utils
function addStyle(styleId, data) {
  const style = Styles.find(s => s.id === styleId)
  style.data = data
}

function getStyle(styleId) {
  const style = Styles.find(s => s.id === styleId)
  return style.data
}

function hasStyle(styleId) {
  const style = Styles.find(s => s.id === styleId)
  return style.data !== null
}

function hasConfig(styleId, styleConfig) {
  const keys = Object.keys(styleConfig.templates.data)
  return keys.includes(styleId)
}

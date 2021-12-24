import Cite from 'citation-js'

import {
  CitationOutputTypes,
  CitationStyles,
  DefaultCitationStyleId,
  StyleTypeShortName,
} from '../constants'

// consts
const Styles = CitationStyles.map((s) => ({ id: s.id, data: null }))

// vars
let cite: any = null

/**
 * @param {object} csl An object formatted following the CSL-JSON schema.
 * See the <a href="https://citeproc-js.readthedocs.io/en/latest/csl-json/markup.html">CSL-JSON documentation</a>.
 * @param {object} options (optional) An object with the formatting options:
 * - `outputType`: Either "bibliography" or "citation". Defaults to "bibliography".
 * - `styleId`: The citation style identifier. Defaults to "mla".
 */
export async function formatCitation(csl: any, options: any) {
  const outputType =
    options && options.outputType
      ? options.outputType
      : CitationOutputTypes.BIBLIOGRAPHY

  const styleId =
    options && options.styleId ? options.styleId : DefaultCitationStyleId

  // error checks
  if (!csl) {
    throw new Error('formatCitation() expected a CSL JSON as first parameter.')
  }
  if (
    outputType !== CitationOutputTypes.BIBLIOGRAPHY &&
    outputType !== CitationOutputTypes.CITATION &&
    outputType !== CitationOutputTypes.BIBTEX
  ) {
    throw new Error(
      'formatCitation() expected `options.outputType` ' +
        `to either be "${CitationOutputTypes.BIBLIOGRAPHY}", ` +
        `or "${CitationOutputTypes.CITATION}". ` +
        `Received "${outputType}". `
    )
  }
  const typeOfStyleId = typeof styleId
  if (typeOfStyleId !== 'string') {
    throw new Error(
      'formatCitation() expected `options.styleId` to be a string. ' +
        `Received "${typeOfStyleId}".`
    )
  }

  if (options.outputType !== CitationOutputTypes.BIBTEX) {
    const style: any = CitationStyles.find((s) => s.id === styleId)
    if (!style) {
      throw new Error(
        'formatCitation() encountered an unhandled value ' +
          `for the \`styleId\` parameter: "${styleId}". `
      )
    }

    // cache to avoid fetching at every call
    let styleData: string | null = ''
    if (!hasStyle(styleId)) {
      // 📡 no style data, must fetch it
      styleData = await Cite.util.fetchFileAsync(style.url)
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
  }

  if (!cite) {
    cite = new Cite(csl)
  } else {
    cite = cite.reset()
    cite.set(csl)
  }

  if (outputType === CitationOutputTypes.BIBTEX) {
    return cite.format(outputType)
  }

  const citation = cite.format(outputType, {
    format: 'html',
    template: styleId,
  })

  const textCitation = cite.format(outputType, {
    format: 'text',
    template: styleId,
  })

  return textCitation?.trim().length ? citation : ''
}

// utils
function addStyle(styleId: StyleTypeShortName, data: any) {
  const style: any = Styles.find((s) => s.id === styleId)
  style.data = data
}

function getStyle(styleId: StyleTypeShortName) {
  const style: any = Styles.find((s) => s.id === styleId)
  return style.data
}

function hasStyle(styleId: StyleTypeShortName) {
  const style: any = Styles.find((s) => s.id === styleId)
  return style.data !== null
}

function hasConfig(styleId: StyleTypeShortName, styleConfig: any) {
  const keys = Object.keys(styleConfig.templates.data)
  return keys.includes(styleId)
}

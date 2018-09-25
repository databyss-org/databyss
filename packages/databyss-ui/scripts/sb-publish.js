const fs = require('fs')

// HACK: replace "Storybook" title
const indexHtmlPath = './build/index.html'
const title = process.argv[2]
fs.writeFileSync(
  indexHtmlPath,
  fs
    .readFileSync(indexHtmlPath)
    .toString()
    .replace(/<title>\s*storybook\s*<\/title>/i, `<title>${title}</title>`)
)

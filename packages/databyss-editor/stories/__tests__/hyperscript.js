import { createHyperscript } from 'slate-hyperscript'

export const jsx = createHyperscript({
  elements: {
    block: { isBlock: true },
  },
})

// converts JSX string to Slate JSON value
export const parse = (string) => {
  const document = new DOMParser().parseFromString(string, 'text/html')
  return jsx('editor', {}, document.body)
}

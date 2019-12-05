import { IS_LINUX } from '@databyss-org/ui/lib/dom'

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add(
  'nextBlock',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).type(`{ctrl}{shift}p`)
  }
)

Cypress.Commands.add(
  'previousBlock',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).type(`{ctrl}{shift}o`)
  }
)

Cypress.Commands.add(
  'endOfLine',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).type(`{ctrl}{shift}{rightarrow}`)
  }
)

Cypress.Commands.add(
  'startOfLine',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).type(`{ctrl}{shift}{leftarrow}`)
  }
)

Cypress.Commands.add(
  'startOfDoc',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).type(`{ctrl}{shift}{uparrow}`)
  }
)

Cypress.Commands.add(
  'endOfDoc',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).type(`{ctrl}{shift}{downarrow}`)
  }
)

Cypress.Commands.add(
  'newLine',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy
      .get(subject)
      .trigger('keydown', { key: 'Enter', release: false })
      .wait(10)
      .trigger('keyup', { key: 'Enter', release: false })
  }
)

Cypress.Commands.add(
  'toggleBold',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).trigger('keydown', {
      keyCode: 66,
      key: 'b',
      [modKeys(IS_LINUX)]: true,
    })
  }
)

Cypress.Commands.add(
  'toggleItalic',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).trigger('keydown', {
      keyCode: 73,
      key: 'i',
      [modKeys(IS_LINUX)]: true,
    })
  }
)

Cypress.Commands.add(
  'selectAll',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).trigger('keydown', {
      keyCode: 65,
      key: 'a',
      [modKeys(IS_LINUX)]: true,
    })
  }
)

// Cypress.Commands.add(
//   'copy',
//   {
//     prevSubject: 'element',
//   },
//   subject => {
//     return cy.get(subject).trigger('keydown', {
//       native: true,
//       keyCode: 67,
//       key: 'c',
//       [modKeys(IS_LINUX)]: true,
//     })
//   }
// )

Cypress.Commands.add(
  'onpaste',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).trigger('keydown', {
      native: true,
      keyCode: 86,
      key: 'v',
      [modKeys(IS_LINUX)]: true,
    })
  }
)

Cypress.Commands.add(
  'toggleLocation',
  {
    prevSubject: 'element',
  },
  subject => {
    return cy.get(subject).trigger('keydown', {
      keyCode: 75,
      key: 'k',
      [modKeys(IS_LINUX)]: true,
    })
  }
)

const modKeys = () => (IS_LINUX ? 'altKey' : 'metaKey')

// from https://gist.github.com/erquhart/37bf2d938ab594058e0572ed17d3837a

Cypress.Commands.add('selection', { prevSubject: true }, (subject, fn) => {
  cy.wrap(subject)
    .trigger('mousedown')
    .then(fn)
    .trigger('mouseup')

  cy.document().trigger('selectionchange')
  return cy.wrap(subject)
})

Cypress.Commands.add(
  'setSelection',
  { prevSubject: true },
  (subject, query, endQuery) => {
    return cy.wrap(subject).selection($el => {
      if (typeof query === 'string') {
        const anchorNode = getTextNode($el[0], query)
        const focusNode = endQuery ? getTextNode($el[0], endQuery) : anchorNode
        const anchorOffset = anchorNode.wholeText.indexOf(query)
        const focusOffset = endQuery
          ? focusNode.wholeText.indexOf(endQuery) + endQuery.length
          : anchorOffset + query.length
        setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)
      } else if (typeof query === 'object') {
        const el = $el[0]
        const anchorNode = getTextNode(el.querySelector(query.anchorQuery))
        const anchorOffset = query.anchorOffset || 0
        const focusNode = query.focusQuery
          ? getTextNode(el.querySelector(query.focusQuery))
          : anchorNode
        const focusOffset = query.focusOffset || 0
        setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)
      }
    })
  }
)

// Low level command reused by `setCursorBefore` and `setCursorAfter`, equal to `setCursorAfter`
Cypress.Commands.add(
  'setCursor',
  { prevSubject: true },
  (subject, query, atStart) => {
    return cy.wrap(subject).selection($el => {
      const node = getTextNode($el[0], query)
      const offset =
        node.wholeText.indexOf(query) + (atStart ? 0 : query.length)
      const document = node.ownerDocument
      document.getSelection().removeAllRanges()
      document.getSelection().collapse(node, offset)
    })
    // Depending on what you're testing, you may need to chain a `.click()` here to ensure
    // further commands are picked up by whatever you're testing (this was required for Slate, for example).
  }
)

Cypress.Commands.add(
  'setCursorBefore',
  { prevSubject: true },
  (subject, query) => {
    cy.wrap(subject).setCursor(query, true)
  }
)

Cypress.Commands.add(
  'setCursorAfter',
  { prevSubject: true },
  (subject, query) => {
    cy.wrap(subject).setCursor(query)
  }
)

Cypress.Commands.add(
  'paste',
  {
    prevSubject: true,
  },
  paste
)

// Helper functions
function getTextNode(el, match) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false)
  if (!match) {
    return walk.nextNode()
  }

  let node
  while ((node = walk.nextNode())) {
    if (node.wholeText.includes(match)) {
      return node
    }
  }
}

function setBaseAndExtent(...args) {
  const document = args[0].ownerDocument
  document.getSelection().removeAllRanges()
  document.getSelection().setBaseAndExtent(...args)
}

export function paste(
  subject,
  { pastePayload, simple = true, pasteType = 'text' }
) {
  if (simple) {
    subject[0].value = pastePayload
    return
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
  const pasteEvent = Object.assign(
    new Event('paste', { bubbles: true, cancelable: true }),
    {
      clipboardData: {
        getData: (type = pasteType) => pastePayload,
      },
    }
  )
  subject[0].dispatchEvent(pasteEvent)

  return subject
}

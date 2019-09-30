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
  (subject, isLinux) => {
    return cy.get(subject).trigger('keydown', {
      keyCode: 66,
      key: 'b',
      which: 91,
      [modKeys(isLinux)]: true,
    })
  }
)

Cypress.Commands.add(
  'toggleItalic',
  {
    prevSubject: 'element',
  },
  (subject, isLinux) => {
    return cy.get(subject).trigger('keydown', {
      keyCode: 66,
      key: 'i',
      which: 91,
      [modKeys(isLinux)]: true,
    })
  }
)

const modKeys = isLinux => (isLinux ? 'altKey' : 'metaKey')

const modType = isLinux => (isLinux ? 'alt' : 'meta')

import { authenticate } from './_helpers'

const firstSource = {
  firstName: 'first name',
  lastName: 'last name',
  citation: 'second citation',
}

const secondSource = {
  citation: 'second citation',
  name: 'updated source',
}

context('Editor', () => {
  beforeEach(() => {
    authenticate()
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-page--slate-load-and-save'
    )
    cy.wait(4000)
    cy.reload().wait(4000)
    cy.get('button').then(buttonList => {
      // clicks on populated page
      buttonList[1].click()
      cy.wait(4000)
      cy.get('[contenteditable="true"]').as('editor')
      cy.get('#slateDocument').as('slateDocument')
    })
  })

  it('Edits atomic sources', () => {
    cy.get('@editor')
      .get('[data-test-atomic-edit="open"]')
      .click()
      .wait(2000)
    cy.get('#citation')
      .focus()
      .type(firstSource.citation)
    cy.get('#firstName')
      .focus()
      .type(firstSource.firstName)
    cy.get('#lastName')
      .focus()
      .type(firstSource.lastName)

    cy.get('button').then(buttonList => {
      buttonList[4].click()
    })

    cy.get('@editor')
      .focus()
      .endOfDoc()
      .newLine()
      .type('@new source')
      .newLine()
      .previousBlock()
      .setSelection('new source')
      .get('[data-test-atomic-edit="open"]')
      .click()
    cy.wait(2000)
      .get('#name')
      .focus()
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{backspace}')
      .type('{backspace}')
      .type('{backspace}')
      .type('updated')
    cy.get('#citation')
      .focus()
      .type(secondSource.citation)
      .wait(1000)

    cy.get('button').then(buttonList => {
      buttonList[4].click()
    })
    // wait for autosave
    cy.wait(11000)

    // reload the page
    cy.reload().wait(2000)
    cy.get('button').then(buttonList => {
      buttonList[1].click()
      cy.wait(2000)
    })

    cy.get('@editor')
      .focus()
      .setSelection(
        'Stamenov, Language Structure, Discourse and the Access to Consciousness'
      )
      .get('[data-test-atomic-edit="open"]')
      .click()
    cy.wait(2000)
    cy.get('#firstName')
      .invoke('val')
      .then(str => {
        expect(str).to.deep.equal(firstSource.firstName)
      })
    cy.get('#lastName')
      .invoke('val')
      .then(str => {
        expect(str).to.deep.equal(firstSource.lastName)
      })
    cy.get('#citation')
      .focus()
      .invoke('text')
      .then(str => {
        expect(str).to.deep.equal(firstSource.citation)
      })
    cy.get('button').then(buttonList => {
      buttonList[4].click()
    })

    cy.get('@editor')
      .focus()
      .endOfDoc()
      .previousBlock()
      .setSelection('updated source')
      .get('[data-test-atomic-edit="open"]')
      .click()
    cy.get('#name')
      .focus()
      .invoke('text')
      .then(str => {
        expect(str).to.deep.equal(secondSource.name)
      })
    cy.get('#citation')
      .focus()
      .invoke('text')
      .then(str => {
        expect(str).to.deep.equal(secondSource.citation)
      })
  })
})

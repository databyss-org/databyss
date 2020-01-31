context('Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=demos-login--default')
    cy.get('[data-test-id="googleButton"]').as('googleButton')
    cy.get('[data-test-id="emailButton"]').as('emailButton')
    // cy.get('[data-test-path="email"]').as('emailInput')
    // cy.get('[data-test-path="code"]').as('codeInput')
  })

  it('renders the login module', () => {
    cy.get('@googleButton').should('exist')
  })

  context('Email flow', () => {
    beforeEach(() => {
      cy.get('@emailButton')
        .click()
        .wait(2000)
        .get('[data-test-path="email"]')
        .as('emailInput')
        .get('[data-test-id="continueButton"]')
        .as('continueButton')
    })

    it('shows email flow UI and autofocuses', () => {
      cy.get('@emailInput')
        .should('exist')
        .should('have.focus')
        .get('@continueButton')
        .should('exist')
        .should('be.disabled')
    })

    it('enables continue button', () => {
      cy.get('@emailInput')
        .type('foo@bar.com')
        .get('@continueButton')
        .should('not.be.disabled')
    })

    context('Code entry', () => {
      beforeEach(() => {
        cy.get('@emailInput')
          .type('foo@bar.com')
          .get('@continueButton')
          .click()
          .wait(2000)
          .get('[data-test-path="code"]')
          .as('codeInput')
      })

      it('shows code input UI and autofocuses', () => {
        cy.get('@codeInput')
          .should('exist')
          .should('have.focus')
          .get('@continueButton')
          .should('exist')
          .should('be.disabled')
      })

      it('enables continue button', () => {
        cy.get('@codeInput')
          .type('834hrfjlfj')
          .get('@continueButton')
          .should('not.be.disabled')
      })

      it('shows error for bad code', () => {
        cy.get('@codeInput')
          .type('834hrfjlfj')
          .get('@continueButton')
          .click()
          .wait(2000)
          .get('[data-test-id="errorMessage"]')
          .should('contain', 'Code is invalid')
      })

      it('hides code input UI when email changes', () => {
        cy.get('@emailInput')
          .type('something')
          .get('@codeInput')
          .should('not.exist')
      })

      context('Authorized', () => {
        beforeEach(() => {
          cy.get('@codeInput')
            .type('5e17693fcfd842d830117981')
            .get('@continueButton')
            .click()
            .wait(2000)
            .get('[data-test-id="authorized"]')
            .as('authorized')
            .get('[data-test-id="logoutButton"]')
            .as('logoutButton')
        })

        it('accepts a good code', () => {
          cy.get('@authorized').should('exist')
        })

        it('returns to login on logout', () => {
          cy.get('@logoutButton')
            .click()
            .wait(2000)
            .get('@googleButton')
            .should('exist')
        })
      })
    })
  })
})

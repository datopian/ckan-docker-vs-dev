const ckanUserName = Cypress.env('CKAN_USERNAME')
const ckanUserPassword = Cypress.env('CKAN_PASSWORD')

Cypress.on('uncaught:exception', (err, runnable) => {
  console.log(err);
  return false;
})

describe('Listing of reports(public)', () => {
  beforeEach(function () {
    cy.consentCookies()
  })

  it('Can list reports', () => {
    cy.viewport(1440, 720)
    cy.visit('/querytool/public/reports')
    cy.contains('List of all reports')
    cy.contains('Birth Indicators at Detail')
    cy.get('input[name="report_q"]').eq(1).type('Main Causes of Death')
    cy.get('.btn-search').eq(1).click({ force: true})
    cy.contains('1 report found for "Main Causes of Death"')
  })
})

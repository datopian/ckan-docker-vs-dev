const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const getRandomGroupName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("GROUP_NAME_SUFFIX");
const parentName1 = getRandomGroupName() + "-parent"
const parentName2 = getRandomGroupName() + "-parent"
const childName1 = getRandomGroupName() + "-child"
const childName2 = getRandomGroupName() + "-child"
const childName3 = getRandomGroupName() + "-child"
const childNameUnowned = getRandomGroupName() + "-child"

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("Parent/Child Groups", () => {
  beforeEach(function () {
    cy.viewport(1440, 720)
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can enable parent/child groups", () => {
    cy.visit("/ckan-admin/config");

    cy.get("#group_parents_enabled").select("Enabled");
    cy.get('.btn-primary').contains("Update Config").click({ force: true });

    cy.visit("/");

    cy.contains("Other");
    cy.contains("Miscellaneous groups");
  });

  it("Can create parent and child groups", () => {
    cy.visit("/");

    cy.createGroup(parentName1, "parent");
    cy.createGroup(childName1, "child", parentName1);

    cy.visit(`/group/edit/${parentName1}`);
    cy.get('.select2-choices').contains(childName1);

    cy.visit(`/group/edit/${childName1}`);
    cy.get("#field-parent").contains(parentName1);

    cy.createGroup(childNameUnowned, "child");
    cy.createGroup(childName2, "child");
    cy.createGroup(childName3, "child");
    cy.createGroup(parentName2, "parent", [childName2, childName3]);

    cy.visit(`/group/edit/${parentName2}`);
    cy.get('.select2-choices').contains(childName2);
    cy.get('.select2-choices').contains(childName3);

    cy.visit(`/group/edit/${childName2}`);
    cy.get("#field-parent").contains(parentName2);

    cy.visit(`/group/edit/${childName3}`);
    cy.get("#field-parent").contains(parentName2);
  })

  it("Home page shows parent groups", () => {
    cy.visit("/");

    cy.contains(parentName1);
    cy.contains(`Description for ${parentName1}`);

    cy.contains(parentName2);
    cy.contains(`Description for ${parentName2}`);

    cy.contains(childName1).should("not.exist");
    cy.contains(childName2).should("not.exist");
    cy.contains(childName3).should("not.exist");
    cy.contains(childNameUnowned).should("not.exist");
  });

  it("Other page shows unowned groups", () => {
    cy.visit("/");

    cy.contains("Other").click({ force: true });

    cy.contains("Miscellaneous groups");
    cy.contains(childNameUnowned);
    cy.contains(`Description for ${childNameUnowned}`);

    cy.get('#report-search-box > #field-sitewide-search').type(childNameUnowned).type("{enter}");
    cy.contains(`1 child group found for "${childNameUnowned}"`);
  });

  it("Parent group page shows child groups", () => {
    cy.visit("/");

    cy.contains(parentName1).click({ force: true });
    cy.contains(`Description for ${parentName1}`);
    cy.contains(`Additional description for ${parentName1}`);
    cy.contains("1 child group found");
    cy.contains(childName1);
    cy.contains(`Description for ${childName1}`);

    cy.get('#report-search-box > #field-sitewide-search').type(childName1).type("{enter}");
    cy.contains(`1 child group found for "${childName1}"`);

    cy.visit("/");

    cy.contains(parentName2).click({ force: true });
    cy.contains(`Description for ${parentName2}`);
    cy.contains(`Additional description for ${parentName2}`);
    cy.contains("2 child groups found");
    cy.contains(childName2);
    cy.contains(`Description for ${childName2}`);
    cy.contains(childName3);
    cy.contains(`Description for ${childName3}`);

    cy.get('#report-search-box > #field-sitewide-search').type(childName2).type("{enter}");
    cy.contains(`1 child group found for "${childName2}"`);

    cy.get('#report-search-box > #field-sitewide-search').clear().type(childName3).type("{enter}");
    cy.contains(`1 child group found for "${childName3}"`);
  });

  it("Can delete parent and child groups", () => {
    cy.visit("/");

    cy.deleteGroup(childName1);
    cy.deleteGroup(childNameUnowned);
    cy.deleteGroup(childName2);
    cy.deleteGroup(childName3);
    cy.deleteGroup(parentName1);
    cy.deleteGroup(parentName2);
  });

  it("Can disable parent/child groups", () => {
    cy.visit("/ckan-admin/config");

    cy.get("#group_parents_enabled").select("Disabled");
    cy.get('.btn-primary').contains("Update Config").click({ force: true });

    cy.visit("/");

    cy.contains("Miscellaneous groups").should("not.exist")

    cy.visit("/group/new");
    cy.get("#group_relationship_type").should("not.exist");
  });

});

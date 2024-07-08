const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

const uuid = () => Math.random().toString(36).slice(2) + "-test";
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const group = `${uuid()}${Cypress.env("GROUP_NAME_SUFFIX")}`;
const dataset = `${uuid()}-test-dataset`;
const reportName = `${uuid()}-report`;
const resourceId = uuid();

describe("Listing of reports", () => {
  before(function () {
    cy.createOrganizationAPI(org);
    cy.createGroupAPI(group);
    cy.createDatasetAPI(org, dataset, {
      resources: [
        {
          format: "CSV",
          name: "biostats",
          description: "biostats",
          id: resourceId,
          url: "https://people.sc.fsu.edu/~jburkardt/data/csv/ford_escort.csv",
          format: "csv",
        },
      ],
    });
    cy.datastoreSearchAPI(resourceId).then((resourceExists) => {
      cy.log("Resource exists: ", resourceExists);
      if (!resourceExists) {
        cy.datapusherSubmitAPI(resourceId);
      }
    });
  });

  beforeEach(function () {
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can create a report", () => {
    cy.viewport(1440, 720);
    cy.visit("/report/new");
    cy.get("input[name=title]").type(reportName);
    cy.get("textarea[name=description]").type("Test Report Description");
    cy.get('#field-group').select(group);
    // Open the Select2 dropdown
    cy.get(".select2-container").eq(1).click();
    // get div with role of option and data-value of dataset
    cy.get(`div[role="option"][data-value="${dataset}"]`).click();
    // select <select> tag of id #chart_resource and click on the first option
    cy.get("#chart_resource").select("biostats");
    cy.get('input[value="Year"]').click();
    //get select tag with name of data_filter_name_1 and then select the option inside it with value of Sex
    cy.contains("Add Filter").click();
    cy.get('select[name="data_filter_name_1"]').select("Year");
    cy.get('select[name="data_filter_value_1"]').trigger("mousedown");
    cy.wait(2000);
    cy.get('select[name="data_filter_value_1"]').select(2);
    cy.get('input[name="data_filter_alias_1"]').type("Test");
    cy.get('button[name="save_data"]').click();
    cy.contains(reportName);
  });

  it("Can edit a report", () => {
    cy.viewport(1440, 720);
    cy.visit(`/report/edit/${reportName}`);
    cy.get("input[name=title]").clear().type(reportName + " EDITED");
    cy.get('button[name="save_data"]').click();
    cy.contains(reportName + " EDITED");
  });

  it("Can list reports", () => {
    cy.viewport(1440, 720);
    cy.visit("/report");
    cy.contains("Reports");
    cy.contains("New Report");
    cy.contains("Search reports");
    cy.contains(reportName + " EDITED");
    cy.get("#field-giant-search").type(reportName + " EDITED");
    cy.get('button[value="search"]').click({ force: true });
    cy.contains(`1 report found for "${reportName} EDITED"`);
  });

  it("Can check the reports in group", () => {
    cy.viewport(1440, 720);
    cy.visit(`/group/reports/${group}`);
    cy.contains(reportName + " EDITED")
  });

  it("Can delete a report", () => {
    cy.viewport(1440, 720);
    cy.visit("/report");
    cy.contains(reportName + " EDITED").get(".btn").contains("Delete").click();
    cy.get('.modal-footer > .btn-primary').contains("Confirm").click();
    cy.contains("Report and visualizations were removed successfully.");
  });


  after(function () {
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(group);
    cy.deleteOrganizationAPI(org);
  });
});

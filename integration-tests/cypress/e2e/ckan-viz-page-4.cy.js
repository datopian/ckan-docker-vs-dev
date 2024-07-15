const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

const randomName = () => Math.random().toString(36).slice(2);
const uuid = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .padStart(4, "0");
  };
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const group = `${uuid()}${Cypress.env("GROUP_NAME_SUFFIX")}`;
const dataset = `${randomName()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const reportName = `${randomName()}${Cypress.env("REPORT_NAME_SUFFIX")}`;
const resourceId = uuid();

describe("Misc Visualizations", () => {
  before(function () {
    cy.createOrganizationAPI(org);
    cy.createGroupAPI(group);
    cy.createDatasetAPI(org, dataset);
    cy.prepareFile(
      dataset,
      "hypertension_bounds.csv",
      "csv",
      resourceId,
      "hypertension",
      "births",
    );
    cy.datastoreSearchAPI(resourceId).then((resourceExists) => {
      cy.log("Resource exists: ", resourceExists);
      if (!resourceExists) {
        cy.datapusherSubmitAPI(resourceId);
      }
    });
    cy.wait(25000);
  });

  beforeEach(function () {
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can create an image visualization", () => {
    cy.viewport(1440, 720);
    cy.visit("/report/new");
    cy.get("input[name=title]").type(reportName);
    cy.get("textarea[name=description]").type("Test Report Description");
    cy.get(".select2-container").eq(1).click();
    cy.get(`div[role="option"][data-value="${dataset}"]`).click();
    cy.get("#chart_resource").select("hypertension");
    cy.get('input[value="Metric"]').click();
    cy.contains("Add Filter").click();
    cy.get('select[name="data_filter_name_1"]').select("Answer");
    cy.get('select[name="data_filter_value_1"]').trigger("mousedown");
    cy.wait(5000);
    cy.get('select[name="data_filter_value_1"]').select("Hypertensive");
    cy.get('input[name="data_filter_alias_1"]').type("Answer");
    cy.get('button[name="save"]').click({ force: true });

    cy.get("#item_type").select("image");

    cy.get("#add-visualization-btn").click({ force: true });

    cy.get('#field-image-upload').attachFile("pink-blossoms.jpeg");

    cy.get("#save-visualization-btn").click({ force: true });
    cy.contains("Visualizations Successfully updated.");
  });

  it("Can view an image visualization on public page", () => {
    cy.visit(`/querytool/public/${reportName}`);
    cy.visit("/querytool/public/t7nj3v3jbp_report_test");
    cy.get('.html2canvas-ignore').should('be.visible');
    cy.get('.html2canvas-ignore').invoke('attr', 'src').should('match', /pink-blossoms.jpeg$/);
  });

  after(function () {
    cy.deleteReport(reportName);
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(group);
    cy.deleteOrganizationAPI(org);
  });
});

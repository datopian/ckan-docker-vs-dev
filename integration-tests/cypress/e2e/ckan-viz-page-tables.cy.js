const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const tableValues = {
  1: ["99", "68"],
  2: ["3", "1266460"],
  3: ["6", "1383912"],
  4: ["4", "1539876"],
  5: ["18", "1870708"],
  6: ["29", "2585164"],
  7: ["23", "2696924"],
  8: ["1", "2976748"],
  9: ["32", "2979460"],
  10: ["10", "3326760"],
  11: ["17", "3445736"],
  12: ["31", "3852264"],
  13: ["22", "4271584"],
  14: ["26", "4834096"],
  15: ["24", "4900668"],
  16: ["13", "5189884"],
  17: ["27", "5338204"],
  18: ["25", "5487480"],
  19: ["2", "5557328"],
  20: ["12", "5852368"],
  21: ["5", "5875448"],
  22: ["8", "6179304"],
  23: ["28", "6677724"],
  24: ["20", "6689244"],
  25: ["7", "8156180"],
  26: ["16", "9002348"],
  27: ["19", "9585112"],
  28: ["11", "12355156"],
  29: ["30", "12519000"],
  30: ["21", "12624416"],
  31: ["14", "15295120"],
  32: ["9", "16277052"],
  33: ["15", "28616300"],
  34: ["0", "219208096"],
};
const tableValues2 = {
  1: [
    "All levels",
    "All sexes",
    "21383828",
    "10318730",
    "276860",
    "3156",
    "93168",
  ],
  2: ["All levels", "Female", "5196534", "", "", "", ""],
  3: ["All levels", "Male", "5480350", "", "", "", ""],
  4: ["All levels", "Unknown", "15030", "", "", "", ""],
};

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
const org = `${randomName()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const group = `${randomName()}${Cypress.env("GROUP_NAME_SUFFIX")}`;
const dataset = `${randomName()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const reportName = `${randomName()}${Cypress.env("REPORT_NAME_SUFFIX")}`;
const resourceId = uuid();

describe("Tables", () => {
  before(function () {
    cy.createOrganizationAPI(org);
    cy.createGroupAPI(group);
    cy.createDatasetAPI(org, dataset);
    cy.prepareFile(dataset, "births_08_17_table_mex.csv", "csv", resourceId, "birth tests", "births");
    cy.datastoreSearchAPI(resourceId).then((resourceExists) => {
      cy.log("Resource exists: ", resourceExists);
      if (!resourceExists) {
        cy.datapusherSubmitAPI(resourceId);
      }
    });
    cy.wait(25000)
  });

  beforeEach(function () {
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can create a table", () => {
    cy.viewport(1440, 720);
    cy.visit("/report/new");
    cy.get("input[name=title]").type(reportName);
    cy.get("textarea[name=description]").type("Test Report Description");
    // Open the Select2 dropdown
    cy.get(".select2-container").eq(1).click();
    // get div with role of option and data-value of dataset
    cy.get(`div[role="option"][data-value="${dataset}"]`).click();
    // select <select> tag of id #chart_resource and click on the first option
    cy.get("#chart_resource").select("birth tests", { force: true });
    cy.get('input[value="Count"]').click();
    //get select tag with name of data_filter_name_1 and then select the option inside it with value of Sex
    cy.contains("Add Filter").click();
    cy.get('select[name="data_filter_name_1"]').select("Education Level");
    cy.get('select[name="data_filter_value_1"]').trigger("mousedown");
    cy.wait(2000);
    cy.get('select[name="data_filter_value_1"]').select(5);
    cy.get('input[name="data_filter_alias_1"]').type("Test");
    cy.get('button[name="save"]').click({ force: true });
    cy.get("#item_type").select("table");
    cy.get("#add-visualization-btn").click({ force: true });

    for (let i = 1; i <= 25; i++) {
      cy.get(`:nth-child(${i}) > .sorting_2 > div`).contains(tableValues[i][0]);
      cy.get(`:nth-child(${i}) > .sorting_1 > div`).contains(tableValues[i][1]);
    }

    cy.get("#table_field_title_1").type(
      "Test Table Title: {measure|capitalize}",
      { parseSpecialCharSequences: false }
    );
    cy.get("#table_main_value_1").select("Education Level");
    cy.get("#table_second_value_1").select("Sex");
    cy.get("#table_category_name_1").select("Place of Birth");
    cy.get("#table_field_filter_name_1").select("Year");
    cy.get("#table_field_filter_value_1").focus().trigger("mousedown").trigger("mousedown").trigger("mousedown");
    cy.get('select[name="table_field_filter_value_1"]').select("2010");
    cy.get("#table_field_filter_alias_1").type("Year");
    cy.get(".btn").contains("Update").click({ force: true });

    for (let i = 1; i <= 4; i++) {
      cy.get(
        `#DataTables_Table_0 > tbody > :nth-child(${i}) > .sorting_1`
      ).contains(tableValues2[i][1]);
      cy.get(
        `#DataTables_Table_0 > tbody > :nth-child(${i}) > .sorting_2`
      ).contains(tableValues2[i][0]);
      cy.get(
        `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(3)`
      ).contains(tableValues2[i][2]);

      if (tableValues2[i][3] === "") {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(4)`
        ).should("be.empty");
      } else {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(4)`
        ).contains(tableValues2[i][3]);
      }
      if (tableValues2[i][4] === "") {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(5)`
        ).should("be.empty");
      } else {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(5)`
        ).contains(tableValues2[i][4]);
      }
      if (tableValues2[i][5] === "") {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(6)`
        ).should("be.empty");
      } else {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(6)`
        ).contains(tableValues2[i][5]);
      }
      if (tableValues2[i][6] === "") {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(7)`
        ).should("be.empty");
      } else {
        cy.get(
          `#DataTables_Table_0 > tbody > :nth-child(${i}) > :nth-child(7)`
        ).contains(tableValues2[i][6]);
      }
    }

    cy.get('#save-visualization-btn').click({ force: true });
    cy.contains("Visualizations Successfully updated.");
  });

  it("Can view a table on public page", () => {
    cy.visit(`/querytool/public/${reportName}`);
    cy.wait(2000);
    cy.contains(tableValues2[1][0]);
    cy.contains(tableValues2[1][1]);
    cy.contains(tableValues2[2][0]);
    cy.contains(tableValues2[2][1]);
    cy.contains(tableValues2[3][0]);
    cy.contains(tableValues2[3][1]);

    for (let i = 1; i <= 4; i++) {
      if (tableValues2[i][3] === "") {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(4)`
        ).should("be.empty");
      } else {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(4)`
        ).contains(tableValues2[i][3]);
      }
      if (tableValues2[i][4] === "") {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(5)`
        ).should("be.empty");
      } else {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(5)`
        ).contains(tableValues2[i][4]);
      }
      if (tableValues2[i][5] === "") {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(6)`
        ).should("be.empty");
      } else {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(6)`
        ).contains(tableValues2[i][5]);
      }
      if (tableValues2[i][6] === "") {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(7)`
        ).should("be.empty");
      } else {
        cy.get(
          `tbody > :nth-child(${i}) > :nth-child(7)`
        ).contains(tableValues2[i][6]);
      }
    }
  });

  after(function () {
    cy.deleteReport(reportName);
    cy.deleteDatasetAPI(dataset)
    cy.deleteGroupAPI(group);
    cy.deleteOrganizationAPI(org);
  });
});

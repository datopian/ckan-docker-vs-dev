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

describe("Static reference chart", () => {
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

  it("Can create a bar chart", () => {
    cy.viewport(1440, 720);
    cy.visit("/report/new");
    cy.get("input[name=title]").type(reportName);
    cy.get("textarea[name=description]").type("Test Report Description");
    // Open the Select2 dropdown
    cy.get(".select2-container").eq(1).click();
    // get div with role of option and data-value of dataset
    cy.get(`div[role="option"][data-value="${dataset}"]`).click();
    // select <select> tag of id #chart_resource and click on the first option
    cy.get("#chart_resource").select("hypertension");
    cy.get('input[value="Metric"]').click();
    //get select tag with name of data_filter_name_1 and then select the option inside it with value of Sex
    cy.contains("Add Filter").click();
    cy.get('select[name="data_filter_name_1"]').select("Answer");
    cy.get('select[name="data_filter_value_1"]').trigger("mousedown");
    cy.wait(5000);
    cy.get('select[name="data_filter_value_1"]').select("Hypertensive");
    cy.get('input[name="data_filter_alias_1"]').type("Answer");
    cy.get('button[name="save"]').click({ force: true });
    cy.get("#item_type").select("chart");
    cy.get("#add-visualization-btn").click({ force: true });
    cy.get("#chart_field_graph_1").select("bar");
    cy.get("#chart_field_axis_x_1").select("Indicator", { force: true });
    cy.get("#chart_field_category_name_1").select(
      "Demographic Characteristic",
      {
        force: true,
      },
    );
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    //click on all accordion-button
    cy.get(".accordion-button").eq(3).click();
    cy.get(".accordion-button").eq(4).click();
    cy.get(".accordion-button").eq(5).click();
    cy.get(".accordion-button").eq(6).click();
    cy.get(".accordion-button").eq(7).click();
    cy.get(".accordion-button").eq(8).click();
    cy.get("#chart_field_color_type_1").select("Divergent", { force: true });
    cy.get("#chart_field_color_1_1").invoke("val", "#483d8b", { force: true });
    cy.get("#chart_field_x_text_rotate_1").select("Diagonal", { force: true });
    cy.get("#chart_field_y_label_1").type("Extra title", { force: true });
    cy.get("#chart_field_dynamic_reference_type_1").select("Average", {
      force: true,
    });
    cy.get("#chart_field_show_bounds_1").click();
    cy.get("#chart_field_lower_bounds_1").select("Lower Bound", {
      force: true,
    });
    cy.get("#chart_field_upper_bounds_1").select("Upper Bound", {
      force: true,
    });
    cy.get("#chart_field_static_reference_columns_1").select("Metric|Metric", {
      force: true,
    });
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    cy.wait(5000);
    cy.get('button[name="save"]').click({ force: true });
    cy.visit(`querytool/public/${reportName}`);
    cy.get(".groups").contains(
      "Percentage with raised BP (SBP >= 140 and/or DBP >= 90 mmHg) or currently on medication for raised BP",
    );
    cy.get('.annotation-text').contains('Reference')
    cy.get(".legendtitletext").contains("Indicator");
    cy.get('.xtick').contains('Rural 18-29')
    cy.getReportData(reportName)
      .its("body.result.filters")
      .should(
        "equal",
        '[{"order": 1, "name": "Answer", "value": "Hypertensive", "alias": "Answer", "visibility": "public"}]',
      );
    cy.getReportData(reportName)
      .its("body.result.sql_string")
      .should(
        "equal",
        `SELECT * FROM \"${resourceId}\" WHERE (\"Answer\" = 'Hypertensive')`,
      );
    cy.getReportVizData(reportName).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body.result.visualizations).to.eq(
        '[{"type": "chart", "order": 1, "graph": "bar", "x_axis": "Indicator", "y_axis": "Metric", "color": null, "color_type": "1", "seq_color": "#feedde,#fdbe85", "title": "", "x_text_rotate": "30", "tooltip_name": null, "data_format": "", "y_tick_format": "", "x_tick_format": "", "padding_bottom": null, "padding_top": null, "tick_count": null, "y_label": "Extra title", "x_label": "", "size": null, "chart_padding_bottom": null, "static_reference_columns": ["Metric|Metric"], "static_reference_label": "", "dynamic_reference_type": "Average", "dynamic_reference_factor": "", "dynamic_reference_label": "", "sort": "default", "additional_description": "", "plotly": "[{\\"x\\":[\\" 18-69\\",\\"18-29\\",\\"30-49\\",\\"50-69\\",\\"Men\\",\\"Men  18-69\\",\\"Men 18-29\\",\\"Men 30-49\\",\\"Men 50-69\\",\\"Rural\\",\\"Rural  18-69\\",\\"Rural 18-29\\",\\"Rural 30-49\\",\\"Rural 50-69\\",\\"Rural Men\\",\\"Rural Women\\",\\"Total\\",\\"Urban\\",\\"Urban  18-69\\",\\"Urban 18-29\\",\\"Urban 30-49\\",\\"Urban 50-69\\",\\"Urban Men\\",\\"Urban Women\\",\\"Women\\",\\"Women  18-69\\",\\"Women 18-29\\",\\"Women 30-49\\",\\"Women 50-69\\"],\\"y\\":[\\"18.9\\",\\"5.4\\",\\"17.3\\",\\"40.2\\",\\"23.1\\",\\"23.1\\",\\"8.7\\",\\"22.3\\",\\"45.5\\",\\"19.2\\",null,null,null,null,null,null,\\"18.9\\",\\"18.4\\",null,null,null,null,null,null,\\"14.9\\",\\"14.9\\",\\"1.9\\",\\"12.3\\",\\"35.4\\"],\\"type\\":\\"bar\\",\\"name\\":\\"Percentage with raised BP (SBP >= 140 and/or DBP >= 90 mmHg) or currently on medication for raised BP\\",\\"width\\":0.5,\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#483d8b\\"}}]", "line_types": "solid", "line_widths": "4", "bar_width": "0.5", "donut_hole": null, "upper_bounds": "Upper Bound", "lower_bounds": "Lower Bound", "show_bounds": "true", "x_text_multiline": "false", "x_tick_culling_max": null, "show_legend": "true", "show_legend_title": "true", "custom_legend_title": "", "show_annotations": "false", "show_labels": "false", "y_label_hide": "false", "x_label_hide": "false", "show_labels_as_percentages": "false", "y_from_zero": "false", "axis_max": "", "axis_min": "", "axis_range": "false", "x_from_zero": "false", "filter_name": "", "filter_value": "", "filter_alias": "", "filter_visibility": "", "category_name": "Demographic Characteristic", "x_sort_labels": "false"}]',
      );
    });
  });

  after(function () {
    cy.deleteReport(reportName);
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(group);
    cy.deleteOrganizationAPI(org);
  });
});

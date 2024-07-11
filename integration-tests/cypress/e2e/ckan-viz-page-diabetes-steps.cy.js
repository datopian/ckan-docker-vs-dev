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
      "steps_portal_diabetes_time_vn.csv",
      "csv",
      resourceId,
      "steps_diabetes",
      "steps_diabetes",
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
    cy.get("#chart_resource").select("steps_diabetes");
    cy.get('input[value="Metric"]').click();
    cy.get('input[value="Estimated Population"]').click();
    //get select tag with name of data_filter_name_1 and then select the option inside it with value of Sex
    cy.contains("Add Filter").click();
    cy.get('select[name="data_filter_name_1"]').select("Indicator");
    cy.get('select[name="data_filter_value_1"]').trigger("mousedown");
    cy.wait(5000);
    cy.get('select[name="data_filter_value_1"]').select(
      "Percentage who had their blood glucose measured",
    );
    cy.get('input[name="data_filter_alias_1"]').type("Indicator");
    cy.get('button[name="save"]').click({ force: true });
    cy.get("#item_type").select("chart");
    cy.get("#add-visualization-btn").click({ force: true });
    cy.get("#chart_field_graph_1").select("line");
    cy.get("#chart_field_axis_x_1").select("Answer", { force: true });
    cy.get("#chart_field_category_name_1").select("Year", {
      force: true,
    });
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    //click on all accordion-button
    cy.get(".accordion-button").eq(3).click();
    cy.get(".accordion-button").eq(4).click();
    cy.get(".accordion-button").eq(5).click();
    cy.get(".accordion-button").eq(6).click();
    cy.get(".accordion-button").eq(7).click();
    cy.get(".accordion-button").eq(8).click();
    cy.get("#chart_field_x_text_rotate_1").select("Horizontal", {
      force: true,
    });
    cy.get("#chart_field_x_tick_culling_max_1").type(2, { force: true });
    cy.get("#chart_field_y_label_hide_1").click();
    cy.get("#chart_field_y_from_zero_1").click();
    cy.get("#chart_field_y_ticks_format_1").select(",.1f");
    cy.get("#chart_field_filter_name_1").select("Visualization Filter");
    cy.get("#chart_field_filter_value_1").trigger("mousedown");
    cy.wait(2000);
    cy.get("#chart_field_filter_value_1").select("viz_total");
    cy.get("#chart_field_filter_alias_1").type("testing");
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    cy.get("#chart_field_color_1_1").invoke("val", "#483d8b", { force: true });
    cy.get("#chart_field_color_1_1").invoke("val", "#000000", { force: true });
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    cy.wait(5000);
    cy.get("#item_type").select("chart");
    cy.get("#add-visualization-btn").click({ force: true });
    cy.get("#chart_field_graph_1").select("bar");
    cy.get("#chart_field_axis_x_1").select("Demographic Characteristic", {
      force: true,
    });
    cy.get("#chart_field_category_name_1").select("Answer", {
      force: true,
    });
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").eq(0).click();
    cy.get(".accordion-button").eq(3).click();
    cy.get(".accordion-button").eq(4).click();
    cy.get(".accordion-button").eq(5).click();
    cy.get(".accordion-button").eq(6).click();
    cy.get(".accordion-button").eq(7).click();
    cy.get(".accordion-button").eq(8).click();
    cy.get("#chart_field_filter_name_1").select("Visualization Filter");
    cy.get("#chart_field_filter_value_1").trigger("mousedown");
    cy.get("#chart_field_filter_value_1").select("viz_sex");
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").eq(0).click();
    cy.get("#chart_field_color_type_1").select("Divergent", { force: true });
    cy.get("#chart_field_color_1_1").invoke("val", "#483d8b", { force: true });
    cy.get("#chart_field_color_1_1").invoke("val", "#ffffff", { force: true });
    cy.get("#chart_field_bar_width_1").clear().type(3);
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").eq(0).click();
    cy.get("#item_type").select("table");
    cy.get("#add-visualization-btn").click({ force: true });
    cy.get("#table_main_value_1").select("Demographic Characteristic");
    cy.get("#table_second_value_1").select("Answer");
    cy.get("#table_category_name_1").select("Type of indicator");
    cy.get("#table_field_filter_name_1").select("Table Filter");
    cy.get("#table_field_filter_alias_1").type("table");
    cy.get("#table_field_filter_value_1").trigger("mousedown");
    cy.wait(2000);
    cy.get("#table_field_filter_value_1").select("table_total");
    cy.get(".chart-actions").eq(0).get(".update-table-btn").eq(0).click();
    cy.wait(5000);
    cy.get("#chart_field_filter_alias_2").type("testing");
    cy.get("#save-visualization-btn").click({ force: true });
    cy.wait(15000);
    cy.visit(`querytool/public/${reportName}`);
    cy.contains("Measured");
    cy.contains("Estimated");
    cy.contains("Lower Bound");
    cy.contains("Upper Bound");
    cy.get(".legendtext").contains("Measured");
    cy.get(".legendtext").contains("Never measured");
    cy.get(".xtick").contains("2010");
    cy.get(".xtick").contains("2015");
    cy.get(".legendtitletext").contains("Demographic Characteristic");
    cy.getReportData(reportName)
      .its("body.result.filters")
      .should(
        "equal",
        '[{"order": 1, "name": "Indicator", "value": "Percentage who had their blood glucose measured", "alias": "Indicator", "visibility": "public"}]',
      );
    cy.getReportData(reportName)
      .its("body.result.sql_string")
      .should(
        "equal",
        `SELECT * FROM \"${resourceId}\" WHERE (\"Indicator\" = 'Percentage who had their blood glucose measured')`,
      );
    cy.getReportVizData(reportName).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body.result.visualizations).to.eq(
        '[{"type": "chart", "order": 2, "graph": "bar", "x_axis": "Demographic Characteristic", "y_axis": "Metric", "color": null, "color_type": "1", "seq_color": "#feedde,#fdbe85", "title": "", "x_text_rotate": "0", "tooltip_name": null, "data_format": "", "y_tick_format": "", "x_tick_format": "", "padding_bottom": null, "padding_top": null, "tick_count": null, "y_label": "", "x_label": "", "size": null, "chart_padding_bottom": null, "static_reference_columns": [], "static_reference_label": "", "dynamic_reference_type": "", "dynamic_reference_factor": "", "dynamic_reference_label": "", "sort": "default", "additional_description": "", "plotly": "[{\\"x\\":[\\"Measured\\",\\"Never measured\\"],\\"y\\":[\\"31.2\\",\\"68.8\\"],\\"type\\":\\"bar\\",\\"name\\":\\"Men\\",\\"width\\":0.3,\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#ffffff\\"}},{\\"x\\":[\\"Measured\\",\\"Never measured\\"],\\"y\\":[\\"35.3\\",\\"64.7\\"],\\"type\\":\\"bar\\",\\"name\\":\\"Women\\",\\"width\\":0.3,\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#8fbc8f\\"}}]", "line_types": "solid,solid", "line_widths": "4,4", "bar_width": "0.3", "donut_hole": null, "upper_bounds": "", "lower_bounds": "", "show_bounds": "false", "x_text_multiline": "false", "x_tick_culling_max": null, "show_legend": "true", "show_legend_title": "true", "custom_legend_title": "", "show_annotations": "false", "show_labels": "false", "y_label_hide": "false", "x_label_hide": "false", "show_labels_as_percentages": "false", "y_from_zero": "false", "axis_max": "", "axis_min": "", "axis_range": "false", "x_from_zero": "false", "filter_name": "Visualization Filter", "filter_value": "viz_sex", "filter_alias": "testing", "filter_visibility": "public", "category_name": "Answer", "x_sort_labels": "false"}, {"type": "chart", "order": 3, "graph": "line", "x_axis": "Answer", "y_axis": "Metric", "color": null, "color_type": "1", "seq_color": "#feedde,#fdbe85", "title": "", "x_text_rotate": "0", "tooltip_name": null, "data_format": "", "y_tick_format": ",.1f", "x_tick_format": "", "padding_bottom": null, "padding_top": null, "tick_count": null, "y_label": "", "x_label": "", "size": null, "chart_padding_bottom": null, "static_reference_columns": [], "static_reference_label": "", "dynamic_reference_type": "", "dynamic_reference_factor": "", "dynamic_reference_label": "", "sort": "default", "additional_description": "", "plotly": "[{\\"x\\":[\\"2010\\",\\"2015\\"],\\"y\\":[\\"31.64\\",\\"33.3\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"31.64\\",\\"33.3\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"Measured\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"solid\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#000000\\"}},{\\"x\\":[\\"2010\\",\\"2015\\"],\\"y\\":[\\"63.37\\",\\"66.7\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"63.37\\",\\"66.7\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"Never measured\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"solid\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#8fbc8f\\"}}]", "line_types": "solid,solid", "line_widths": "4,4", "bar_width": null, "donut_hole": null, "upper_bounds": "", "lower_bounds": "", "show_bounds": "false", "x_text_multiline": "false", "x_tick_culling_max": "2", "show_legend": "true", "show_legend_title": "true", "custom_legend_title": "", "show_annotations": "false", "show_labels": "false", "y_label_hide": "true", "x_label_hide": "false", "show_labels_as_percentages": "false", "y_from_zero": "true", "axis_max": null, "axis_min": null, "axis_range": "false", "x_from_zero": "false", "filter_name": "Visualization Filter", "filter_value": "viz_total", "filter_alias": "testing", "filter_visibility": "public", "category_name": "Year", "x_sort_labels": "false"}, {"type": "table", "order": 1, "y_axis": "Metric", "main_value": "Demographic Characteristic", "second_value": "Answer", "title": "", "data_format": "", "filter_name": "Table Filter", "filter_value": "table_total", "filter_alias": "table", "filter_visibility": "public", "category_name": "Type of indicator"}]',
      );
    });
  });

  after(function () {
    //cy.deleteReport(reportName);
    //cy.deleteDatasetAPI(dataset);
    //cy.deleteGroupAPI(group);
    //cy.deleteOrganizationAPI(org);
  });
});

import { defineConfig } from "cypress";

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  includeShadowDom: true,
  env: {
    FRONTEND_URL: "",
    API_KEY:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJZQ24zYmhKT1lVeEM1U0dsUWViMGVBVlZjblNEaERUY3hhVXdsWGtKNVdJIiwiaWF0IjoxNzE2OTEzODQxfQ.RjEoaLro4I_hok81FbBMcAV_6OTc7lpwolBl8Cc0Z5Q",
    CKAN_USERNAME: "ckan_admin",
    CKAN_PASSWORD: "test1234",
    ORG_NAME_SUFFIX: "_organization_test",
    GROUP_NAME_SUFFIX: "_group_test",
    DATASET_NAME_SUFFIX: "_dataset_test",
  },
  e2e: {
    baseUrl: "http://ckan-dev:5000",
  },
});

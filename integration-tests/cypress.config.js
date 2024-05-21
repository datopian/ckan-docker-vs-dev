import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  includeShadowDom: true,
  env: {
    FRONTEND_URL: '',
    API_KEY:
      'CKAN_API_TOKEN',
    CKAN_USERNAME: 'ckan_admin',
    CKAN_PASSWORD: 'test1234',
    ORG_NAME_SUFFIX: '_organization_test',
    DATASET_NAME_SUFFIX: '_dataset_test',
  },
  e2e: {
    baseUrl: 'http://ckan-dev:5000',
  },
})

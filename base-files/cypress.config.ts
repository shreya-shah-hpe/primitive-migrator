// (c) Copyright 2024 Hewlett Packard Enterprise Development LP
import { defineConfig } from "cypress";
import baseConfig from "@primitive-components/cypress-config";

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    specPattern: "cypress/**/acceptance/**.js",
    excludeSpecPattern: "*selectors.js",
  },
});

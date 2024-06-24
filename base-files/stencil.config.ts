// (c) Copyright 2024 Hewlett Packard Enterprise Development LP

import { Config } from "@stencil/core";
import { postcss } from "@stencil-community/postcss";
import autoprefixer from "autoprefixer";
import { baseConfig } from "@primitive-components/stencil-config";
import storageStyles from "@storage/dscc-storage-styles";

export const config: Config = {
  namespace: "{{plugingName}}",
  ...(baseConfig as Config),
  plugins: [
    ...baseConfig.plugins,
    postcss({
      // Add postcss plugins
      plugins: [storageStyles, autoprefixer()],
    }),
  ],
};

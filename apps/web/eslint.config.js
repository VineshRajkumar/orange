import { nextJsConfig } from "@repo/eslint-config/next-js";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config} */
// export default nextJsConfig;
export default [
  ...nextJsConfig, 
  prettier        
];

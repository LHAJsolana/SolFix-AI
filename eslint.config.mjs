import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**", "coverage/**"]
  },
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off"
    }
  }
];

export default config;

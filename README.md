# Dev-Tools

Collection of useful developer tools.

## Spectral OpenAPI Validator

Paste your Openapi/Swagger spec into the editor and validate it using [Spectral](https://stoplight.io/open-source/spectral).

### Using different Rulesets

Different ruleset can be selected using the dropdown menu `Select Ruleset`.

### Upload custom rulesets

You can use the `Import Ruleset` button to either import
  - a ruleset resource via URI (CORS can be a problem here!)
  - a ruleset file via File-Explorer

> Note that there is no validation here

### Shipping predefined custom rulesets

You can add custom rulesets to the [public/rules](./public/rules) directory:
  - Edit the [index.json](./public/rules/index.json) with the corresponding values
  - Add the ruleset json file to the directory
  - Redeploy the site. The rulesets will automatically be detected and loaded.



## Improvements

- Use [Monaco](https://microsoft.github.io/monaco-editor/) as replacement for Ace-Editor. Monaco supports json-schema validation
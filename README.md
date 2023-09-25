# Dev-Tools

[GitHub-Pages](https://ron96g.github.io/dev-tools/)

Collection of useful developer tools.

## Spectral OpenAPI Validator

Paste your Openapi/Swagger spec into the editor and validate it using [Spectral](https://stoplight.io/open-source/spectral).

The editor is implemented using [Monaco](https://microsoft.github.io/monaco-editor/).

**Features:**
- Running 100% in browser and 0% backend logic
- Autocompletion and Validation for OpenAPI and Swagger specifications using [OpenApi](https://github.com/OAI/OpenAPI-Specification/tree/main) and JsonSchema (currently supporting [v2.0](https://github.com/OAI/OpenAPI-Specification/blob/main/schemas/v2.0/schema.json) and [v3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/schemas/v3.0/schema.json))
- Validation of OpenAPI and Swagger specifications using [Spectral](https://stoplight.io/open-source/spectral)
- Import custom Spectral rulesets and cache them in the local browser storage
- Formatting and Converting between JSON and YAML
- Editor-Navigation using `JumpToLine` actions
- Highlighting and clear view of validation findings

### Using different Rulesets

Different ruleset can be selected using the dropdown menu `Select Ruleset`.

### Upload custom rulesets

You can use the `Import Ruleset` button to either import
  - a ruleset resource via URI (CORS can be a problem here!)
  - a ruleset file via File-Explorer

> Note that there is no validation here

### Building with custom rulesets

You can add custom rulesets to the [public/rules](./public/rules) directory:
  - Edit the [index.json](./public/rules/index.json) with the corresponding values
  - Add the ruleset json file to the directory
  - Rebuild the site. The rulesets will automatically be detected and loaded.
import * as monaco from 'monaco-editor';

import * as log from '@/libs/log'
import { SchemaItem } from "@/libs/json-schema";


export const FILE_PREFIX = "inmemory://inmemory/";

export async function configureSchemas(rawSchemas?: Array<SchemaItem>) {
    const deepCopy = JSON.parse(JSON.stringify(rawSchemas));
    const schemas = buildJsonSchemas(deepCopy)
    schemas.forEach(s => log.debug(JSON.stringify(s)))
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: schemas,
    });

    const monacoYaml = await import("monaco-yaml")
    monacoYaml.configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        validate: true,
        schemas: schemas
    })
}


export function buildJsonSchemas(rawSchemas?: Array<SchemaItem>) {
    if (!rawSchemas) {
        return []
    }
    return rawSchemas.map(schema => {
        if (schema.fileMatch) {
            schema.fileMatch = schema.fileMatch.map(f => monaco.Uri.parse(FILE_PREFIX + f).toString())
        }
        return schema
    })
}
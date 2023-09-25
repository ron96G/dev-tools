import * as log from '@/libs/log'

export interface SchemaItem {
    uri: string,
    fileMatch: Array<string>,
    schema: any
}

const URL_BASE = "schemas"
const OPENAPI_VERSIONS = ["2.0", "3.0"] // 3.1 is currently not supported :(
const ASYNCAPI_VERSIONS = ["2.6.0"]

type SCHEMA_TYPE = "openapi" | "asyncapi"

const currentHost = window.location

async function loadSchemas(type: SCHEMA_TYPE, versions: Array<String>) {
    const schemas: Array<SchemaItem> = []

    for (const version of versions) {
        const url = `${URL_BASE}/${type}/v${version}/schema.json`
        const res = await fetch(url)
        if (res.status != 200) {
            log.error(`Failed to fetch schema ${url} (${res.status})`)
            continue
        }
        const uri = `${currentHost}/${URL_BASE}/${type}/v${version}/schema.json`;
        schemas.push({
            uri: uri,
            fileMatch: [`${type}.v${version}`],
            schema: await res.json()
        })
        log.info(`Successfully registered ${type} schema ${url}: ${uri}`)
    }
    return schemas;
}

export async function loadAllSchemas() {
    const all = await Promise.all([loadSchemas('openapi', OPENAPI_VERSIONS), loadSchemas('asyncapi', ASYNCAPI_VERSIONS)])
    return ([] as Array<SchemaItem>).concat(...all)
}
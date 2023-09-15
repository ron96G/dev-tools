import { Ruleset, Spectral, type RulesetDefinition, type ISpectralDiagnostic, Document } from "@stoplight/spectral-core";
import * as Rulesets from '@stoplight/spectral-rulesets'
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import type { AnnotationItem } from "@/components/TextEditor.vue";
import { type IParser, Json as JsonParser, Yaml as YamlParser } from "@stoplight/spectral-parsers";


import { Storage } from "@/libs/storage";

export interface RuleRef {
    name: string
    href?: string
    value?: string
}

export class Linter {

    private readonly rulesets = new Map<string, Ruleset | RulesetDefinition>();

    constructor() {
        this.setRuleset('oas', new Ruleset(Rulesets.oas));
        this.setRuleset('asyncapi', new Ruleset(Rulesets.asyncapi));
    }

    get supportedRulesets() {
        return Array.from(this.rulesets.keys())
    }

    private setRuleset(name: string, ruleset: Ruleset) {
        this.rulesets.set(name, ruleset)
    }

    async addRuleset(name: string, value: string) {
        const fs = {
            promises: {
                async readFile(path: any): Promise<any> {
                    if (path === ".spectral.yaml") {
                        return value
                    }
                },
            },
        };

        this.setRuleset(name, await bundleAndLoadRuleset(".spectral.yaml", { fs, fetch }))
    }

    async addRulesetFromURL(name: string, href: string) {
        const fs = {
            promises: {
                async readFile(path: any): Promise<any> {
                    if (path.startsWith("rules")) {
                        const res = await fetch(path)
                        if (res.status === 200) {
                            return res.text()
                        }
                        throw new Error(`Rule '${path}' not found`)
                    }

                },
            },
        };

        this.setRuleset(name, await bundleAndLoadRuleset(href, { fs, fetch }))
    }


    async setupFromRef(ref: RuleRef) {
        if (ref['href']) {
            await this.addRulesetFromURL(ref.name, ref.href)
        } else if (ref['value']) {
            await this.addRuleset(ref.name, ref.value)
        } else {
            throw Error('Invalid index')
        }
    }

    async setup(storage: Storage) {
        for (const ruleRef of storage.iterator()) {
            await this.setupFromRef(ruleRef)
        }
    }

    async lint(document: Document, ruleset: Ruleset | RulesetDefinition) {
        const spectral = new Spectral();
        try {
            spectral.setRuleset(ruleset)
        } catch (e) {
            throw e
        }
        const result = await spectral.run(document)
        return formatResult(result)
    }


    async lintRaw(input: string, rulesetName: string) {
        const inputType = determineInputType(input)
        const parser: IParser<any> = (inputType === "json") ? JsonParser : YamlParser;
        const document = new Document(input, parser, "openapi." + inputType);

        if (!this.rulesets.has(rulesetName)) {
            throw Error(`No ruleset called '${rulesetName}' exists.`)
        }
        const ruleset = this.rulesets.get(rulesetName)!;
        return this.lint(document, ruleset)
    }
}

export function determineInputType(input: string) { // TODO improve this
    if (input[0] == "{") {
        return 'json'
    }
    return 'yaml'
}

function determineSeverity(severity: number, code: string | number): AnnotationItem['severity'] {
    if (code === "unrecognized-format") {
        return 'error'
    }
    if (severity == 0) {
        return "error"
    } else if (severity == 1) {
        return "warning"
    }
    return "warning" // TODO add custom annotation type for info
}

function formatResult(inputs: Array<ISpectralDiagnostic>) {
    const results: Array<AnnotationItem> = []

    for (const input of inputs) {
        results.push({
            message: input.message,
            start: {
                line: input.range.start.line,
                char: input.range.start.character
            },
            end: {
                line: input.range.end.line,
                char: input.range.end.character
            },
            severity: determineSeverity(input.severity, input.code),
            code: input.code,
            action: "unknown"
        })
    }

    return results
}

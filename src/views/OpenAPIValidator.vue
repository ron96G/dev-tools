<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from "vue";
import ImportPopup from '@/components/ImportPopup.vue'
import IntoTable, { InfoItem } from '@/components/IntoTable.vue'
import TextEditor from '@/components/editor/NextTextEditor.vue'
import { Linter, determineInputType } from "@/libs/linter";
import { Storage } from "@/libs/storage";
import { SchemaItem, loadAllSchemas } from "@/libs/json-schema";
import { convertInput, formatInput } from '@/libs/format'
import * as log from '@/libs/log'

const props = defineProps({
    theme: {
        type: String,
        default: 'dark'
    }
})

// Variables

const _localStorage = Storage.loadFromLocalStorage("index.json")
const _serverStorage = Storage.loadFromServer("rules/index.json")
const _linter = new Linter()

const editorTheme = ref('dark')
const supportedRulesets: Ref<Array<string>> = ref([])
const supportedSchemaVersions: Ref<Array<string>> = ref([])
const focusLine: Ref<Number | Object> = ref(0)
const annotations: Ref<Array<InfoItem>> = ref([])
const input = ref("")
const valueTracker = ref("")
const inputType = ref("yaml")
const showImportPopup = ref(false)
const selectedRuleset = ref("default")
const selectedSchemaVersion = ref("openapi.v3.0")
const jsonSchemas: Ref<Array<SchemaItem>> = ref([])

// Observers

watch(() => props.theme, (val: string) => {
    editorTheme.value = val
})

// Hooks

onMounted(async () => {
    await _linter.setup(_localStorage)
    await _linter.setup(await _serverStorage)
    supportedRulesets.value = _linter.supportedRulesets
    selectedRuleset.value = "default"
    jsonSchemas.value = await loadAllSchemas()
    supportedSchemaVersions.value = jsonSchemas.value.map(s => s.fileMatch?.[0])
    selectedSchemaVersion.value = "openapi.v3.0"
})

async function onInit(editor: any) {
    valueTracker.value = editor.getValue()
}

async function onChange(value: string) {
    valueTracker.value = value
    inputType.value = determineInputType(value)
    try {
        const result = await _linter.lintRaw(value, selectedRuleset.value)
        annotations.value = result

    } catch (e) {
        // could not validate, whatever...
        log.debug('Failed to lint ' + e)
    }
}

async function onUpdatedSelectedRuleset(e: any) {
    selectedRuleset.value = e.detail.value;
    await onChange(valueTracker.value)
}

async function onUpdatedSelectedSchemaVersion(e: any) {
    selectedSchemaVersion.value = e.detail.value;
    await onChange(valueTracker.value)
}

async function onImport(obj: any) {
    try {
        await _linter.addRuleset(obj.name, obj.text)
        supportedRulesets.value = _linter.supportedRulesets
        _localStorage.set({
            name: obj.name,
            value: obj.text
        })
        _localStorage.saveToLocalStorage()
        selectedRuleset.value = obj.name
        await onChange(valueTracker.value)

    } catch (e) {
        console.log(e)
        alert(e)
    }
}

// Actions

function doJumpToLine(linePosition: number | { column: number, line: number }) {
    focusLine.value = linePosition;
}

async function doResetAll() {
    localStorage.clear()
    input.value = ""
    location.reload()
}

async function doFormatInput() {
    try {
        input.value = formatInput(valueTracker.value) ?? ""
    } catch (e) {
        console.log(e)
    }
}

async function doConvertInput() {
    try {
        input.value = convertInput(valueTracker.value) ?? ""
    } catch (e) {
        console.log(e)
    }
}
</script>


<template>
    <ImportPopup :show="showImportPopup" @changed="(val) => showImportPopup = val" @imported="onImport"></ImportPopup>

    <div id="openapi-validator-wrapper">
        <div id="content">
            <div id="controls-wrapper">
                <div id="ruleset-wrapper" class="controls-item">
                    <scale-dropdown-select label="Select Ruleset" :value="selectedRuleset"
                        @scale-change="onUpdatedSelectedRuleset">
                        <template v-for="ruleset in supportedRulesets">
                            <scale-dropdown-select-item :value="ruleset">{{ ruleset
                            }}</scale-dropdown-select-item>
                        </template>
                    </scale-dropdown-select>
                </div>
                <div id="schema-wrapper" class="controls-item">
                    <scale-dropdown-select label="Select Schema Version" :value="selectedSchemaVersion"
                        @scale-change="onUpdatedSelectedSchemaVersion">
                        <template v-for="schemaVersion in supportedSchemaVersions">
                            <scale-dropdown-select-item :value="schemaVersion">{{ schemaVersion
                            }}</scale-dropdown-select-item>
                        </template>
                    </scale-dropdown-select>
                </div>
                <scale-button class="controls-item" @click="showImportPopup = true"> Import<br>Ruleset </scale-button>
                <scale-button class="controls-item" @click="doJumpToLine(1)"> Jump<br>
                    To Top</scale-button>
                <scale-button class="controls-item" @click="doFormatInput"> Format</scale-button>
                <scale-button class="controls-item" @click="doConvertInput"> Convert<br>(json/yaml)</scale-button>
                <scale-button class="controls-item" @click="doResetAll"> Reset</scale-button>
            </div>

            <TextEditor id="input-editor" :value="input" :lang="inputType" @update:value="onChange" @init="onInit"
                :annotations="annotations" :focusLine="focusLine" :theme="editorTheme" :schemas="jsonSchemas"
                :modelFileUri="selectedSchemaVersion"></TextEditor>


            <IntoTable :infos="annotations" @jump-to-line="doJumpToLine"></IntoTable>
        </div>
    </div>
</template>

<style scoped>
#controls-wrapper {
    display: flex;
    margin-bottom: 5px;
}

.controls-item {
    margin-right: 5px;
}

#openapi-validator-wrapper {
    position: relative;
}

#content {
    display: block;
    max-width: 2000px;
    margin: auto;
}

#ruleset-wrapper {
    min-width: 250px;
    max-width: 300px;
}

#schema-wrapper {
    min-width: 200px;
    max-width: 300px;
}

#input-editor {
    height: 60vh;
}
</style>
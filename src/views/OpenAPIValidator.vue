<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from "vue";
import { type Ace } from "ace-builds";
import YAML from 'js-yaml';

import ImportPopup from '@/components/ImportPopup.vue'
import IntoTable from '@/components/IntoTable.vue'
import TextEditor, { type AnnotationItem } from '@/components/TextEditor.vue'
import { Linter, determineInputType } from "@/libs/linter";
import { Storage } from "@/libs/storage";

const props = defineProps({
    theme: {
        type: String,
        default: 'dark'
    }
})

const editorTheme = ref('tomorrow_night_eighties')
const _localStorage = Storage.loadFromLocalStorage("index.json")
const _serverStorage = Storage.loadFromServer("rules/index.json")
const _linter = new Linter()
const supportedRulesets: Ref<Array<string>> = ref([])

const focusLine = ref(0)
const annotations: Ref<Array<AnnotationItem>> = ref([])
const input = ref("")
const valueTracker = ref("")
const inputType = ref("yaml")
const showImportPopup = ref(false)
const selectedRuleset = ref("default")

watch(() => props.theme, (val: string) => {
    if (val === 'dark') {
        editorTheme.value = 'tomorrow_night_eighties'
    } else {
        editorTheme.value = 'chrome'
    }
})

onMounted(async () => {
    await _linter.setup(_localStorage)
    await _linter.setup(await _serverStorage)
    supportedRulesets.value = _linter.supportedRulesets
    selectedRuleset.value = "default"
})

async function onInit(editor: Ace.Editor) {
    valueTracker.value = editor.getValue()
}

async function onChange(value: string) {
    valueTracker.value = value
    try {
        const result = await _linter.lintRaw(value, selectedRuleset.value)
        annotations.value = result

    } catch (e) {
        // could not validate, whatever...
    }
}

async function onUpdatedSelectedRuleset(e: any) {
    selectedRuleset.value = e.detail.value;
    await onChange(valueTracker.value)
}

function jumpToLine(lineNumber: number) {
    console.log(`Jump to line ${lineNumber}`)
    focusLine.value = lineNumber;
}

async function resetAll() {
    localStorage.clear()
    input.value = ""
    location.reload()
}

async function formatInput() {
    try {
        if (determineInputType(valueTracker.value) == 'json') {
            input.value = JSON.stringify(JSON.parse(valueTracker.value), null, 2)
        } else {
            input.value = YAML.dump(YAML.load(valueTracker.value), { indent: 2 })
        }
    } catch (e) {
        console.log(e)
    }
}

async function convertInput() {
    try {
        if (determineInputType(valueTracker.value) == 'json') {
            input.value = YAML.dump(JSON.parse(valueTracker.value))
        } else {
            input.value = JSON.stringify(YAML.load(valueTracker.value), null, 2)
        }

    } catch (e) {
        console.log(e)
    }
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
                <scale-button class="controls-item" @click="showImportPopup = true"> Import<br>Ruleset </scale-button>
                <scale-button class="controls-item" @click="jumpToLine(1)"> Jump<br>
                    To Top</scale-button>
                <scale-button class="controls-item" @click="formatInput"> Format</scale-button>
                <scale-button class="controls-item" @click="convertInput"> Convert<br>(json/yaml)</scale-button>
                <scale-button class="controls-item" @click="resetAll"> Reset</scale-button>
            </div>

            <TextEditor id="input-editor" :value="input" :lang="inputType" @update:value="onChange" @init="onInit"
                :annotations="annotations" :focusLine="focusLine" :theme="editorTheme"></TextEditor>


            <IntoTable :infos="annotations" @jump-to-line="jumpToLine"></IntoTable>
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

#input-editor {
    height: 60vh;
}
</style>
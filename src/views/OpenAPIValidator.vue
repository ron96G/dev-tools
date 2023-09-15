<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from "vue";
import type { Ace } from "ace-builds";
import YAML from 'js-yaml';

import TextEditor, { type AnnotationItem } from '@/components/TextEditor.vue'
import { Linter, determineInputType } from "@/libs/linter";
import { Storage } from "@/libs/storage";


const _localStorage = Storage.loadFromLocalStorage("index.json")
const _serverStorage = Storage.loadFromServer("rules/index.json")
const _linter = new Linter()
const supportedRulesets: Ref<Array<string>> = ref([])

const focusLine = ref(0)
const annotations: Ref<Array<AnnotationItem>> = ref([])
const input = ref("")
const inputType = ref("yaml")

const selectedRuleset = ref("default")


onMounted(async () => {
    await _linter.setup(_localStorage)
    await _linter.setup(await _serverStorage)
    supportedRulesets.value = _linter.supportedRulesets
    selectedRuleset.value = "default"
})

function jumpToLine(lineNumber: number) {
    console.log(`Jump to line ${lineNumber}`)
    focusLine.value = lineNumber;
}

async function updateSelectedRuleset(e: any) {
    selectedRuleset.value = e.detail.value;
    await onChange(input.value)
}

async function uploadFile(e: Event) {
    const files = (e.target as any)?.files as File[]
    if (files && files.length >= 1) {
        const uploadedFile = files[0]
        try {
            const text = await uploadedFile.text()
            await _linter.addRuleset(uploadedFile.name, text)
            supportedRulesets.value = _linter.supportedRulesets
            _localStorage.set({
                name: uploadedFile.name,
                value: text
            })
            _localStorage.saveToLocalStorage()

        } catch (e) {
            throw e
        }
    }
}

async function onInit(editor: Ace.Editor) {
    input.value = editor.getValue()
}

async function onChange(value: string) {

    input.value = value
    try {
        const result = await _linter.lintRaw(value, selectedRuleset.value)
        annotations.value = result

    } catch (e) {
        // could not validate, whatever...
    }
}

async function resetAll() {
    localStorage.clear()
    input.value = ""
}

async function formatInput() {
    try {
        input.value = JSON.stringify(JSON.parse(input.value), null, 2)
    } catch (e) {
        // ignore
    }
}

async function convertInput() {
    try {
        if (determineInputType(input.value) == 'json') {
            input.value = YAML.dump(JSON.parse(input.value))
        } else {
            input.value = JSON.stringify(YAML.load(input.value), null, 2)
        }

    } catch (e) {
        // ignore
    }
}

</script>


<template>
    <div id="openapi-validator-wrapper">
        <div id="content">
            <div id="text-editor-wrapper">
                <div id="controls-wrapper">
                    <div id="ruleset-wrapper" class="controls-item">
                        <scale-dropdown-select label="Select Ruleset" @scale-change="updateSelectedRuleset"
                            :value="selectedRuleset">
                            <template v-for="ruleset in supportedRulesets">
                                <scale-dropdown-select-item :value="ruleset">{{ ruleset }}</scale-dropdown-select-item>
                            </template>
                        </scale-dropdown-select>
                    </div>
                    <label for="file-upload" class="controls-item">
                        Upload
                    </label>
                    <input type="file" class="controls-item" id="file-upload" @change="uploadFile">

                    <scale-button class="controls-item" @click="jumpToLine(1)"> Jump
                        To Top</scale-button>

                    <scale-button class="controls-item" @click="formatInput"> Format</scale-button>

                    <scale-button class="controls-item" @click="convertInput"> Convert (json/yaml)</scale-button>

                    <scale-button class="controls-item" @click="resetAll"> Reset</scale-button>
                </div>


                <TextEditor id="input-editor" :value="input" :lang="inputType" @update:value="onChange" @init="onInit"
                    :annotations="annotations" :focusLine="focusLine"></TextEditor>
            </div>

            <div id="notification-wrapper">
                <table v-if="annotations.length > 0">
                    <tr>
                        <th class="column-level">Level</th>
                        <th class="column-message">Message</th>
                        <th class="column-message">Action</th>
                        <th class="column-message">Jump To Line</th>
                    </tr>
                    <template v-for="item in annotations">
                        <tr>
                            <td class="column-level"> {{ item.severity.toUpperCase() }} </td>
                            <td class="column-message"> {{ item.message }} ({{ item.code }})</td>
                            <td class="column-message"> {{ item.code }}</td>
                            <td class="column-message"> <scale-button @click="jumpToLine(item.start.line)"> Jump
                                    To</scale-button></td>
                        </tr>
                    </template>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
#controls-wrapper {
    display: flex;
}

.controls-item {
    margin-right: 5px;
}

#openapi-validator-wrapper {
    position: relative;
    top: 10rem;
}

#content {
    display: block;
    max-width: 1500px;
    margin: auto;
}

#ruleset-wrapper {
    min-width: 250px;
    max-width: 300px;
}

#notification-wrapper {
    padding-top: 20px;
}

table,
td,
th {
    border-spacing: 30px;
}

th {
    padding: 10px;
    font-weight: bold;
}

tr:hover {
    background-color: var(--telekom-color-background-surface-highlight);
}

table {
    width: 100%;
    border-collapse: collapse;
}

.column-level {
    text-align: start;
    padding-right: 10px;
    padding-left: 1px;
}

.column-message {
    text-align: start;
    padding-left: 1px;
}

label {
    cursor: pointer;
    display: block;
    box-sizing: border-box;
    height: 44px;
    color: var(--telekom-color-text-and-icon-white-standard);
    background-color: var(--telekom-color-primary-standard);
    border-radius: 1ch;
    padding: 10px 20px 5px 20px;
    font-size: var(--telekom-typography-font-size-body);
    font-weight: var(--telekom-typography-font-weight-bold);
}

#file-upload {
    opacity: 0;
    position: absolute;
    z-index: -1;
}
</style>
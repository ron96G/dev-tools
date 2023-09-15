<script setup lang="ts">
import { markRaw, onMounted, ref, watch, type Ref, onUnmounted, computed } from 'vue';
import ace from 'ace-builds';
import ResizeObserver from 'resize-observer-polyfill';
import modeJsonUrl from 'ace-builds/src-noconflict/mode-json?url';
import modeYamlUrl from 'ace-builds/src-noconflict/mode-yaml?url';
import themeChromeUrl from 'ace-builds/src-noconflict/theme-chrome?url';
import themeTwilightUrl from 'ace-builds/src-noconflict/theme-twilight?url';
import themeTomorrowNightUrl from 'ace-builds/src-noconflict/theme-tomorrow_night_eighties?url';

ace.config.setModuleUrl('ace/mode/json', modeJsonUrl);
ace.config.setModuleUrl('ace/mode/yaml', modeYamlUrl);
ace.config.setModuleUrl('ace/theme/chrome', themeChromeUrl);
ace.config.setModuleUrl('ace/theme/twilight', themeTwilightUrl);
ace.config.setModuleUrl('ace/theme/tomorrow_night_eighties', themeTomorrowNightUrl);

export interface AnnotationItem {
    start: {
        line: number,
        char: number
    },
    end: {
        line: number,
        char: number
    },
    severity: 'error' | 'warning' | 'information',
    message: string,
    code: string | number,
    action?: string
}


const props = defineProps({
    id: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        default: 'text'
    },
    theme: {
        type: String,
        default: 'tomorrow_night_eighties'
    },
    placeholder: String,
    readonly: Boolean,
    wrap: {
        type: Boolean,
        default: true,
    },
    printMargin: {
        type: [Boolean, Number],
        default: true,
    },
    minLines: Number,
    maxLines: Number,
    options: Object,
    annotations: Array<AnnotationItem>,
    focusLine: Number,
})

const emit = defineEmits(["update:value", "init"])

const editor: Ref<ace.Ace.Editor | null> = ref(null)

watch(() => props.value, async (newValue) => {
    editor.value?.setValue(newValue)
})

watch(() => props.lang, async (newLang) => {
    editor.value?.session.setMode('ace/mode/' + newLang)
})

watch(() => props.focusLine, async (newFocusLine) => {
    if (!newFocusLine || newFocusLine < 1) return
    editor.value?.gotoLine(newFocusLine, 0, false)
    editor.value?.selection.moveCursorToPosition({ row: newFocusLine, column: 0 })
})

watch(() => props.annotations, async (inputs) => {
    if (!inputs) return
    const annotations: Array<ace.Ace.Annotation> = []
    for (const input of inputs) {
        if (!input) continue

        annotations.push({
            text: input.message,
            type: input.severity || 'warning',
            row: input.start.line || 1,
            column: 0,
        })
    }
    editor.value?.session.setAnnotations(annotations)
})


onMounted(() => {
    const editorRef = document.getElementById(props.id)!

    const _editor = editor.value = markRaw(ace.edit(editorRef, {
        placeholder: props.placeholder,
        readOnly: props.readonly,
        value: props.value,
        mode: 'ace/mode/' + props.lang,
        theme: 'ace/theme/' + props.theme,
        wrap: props.wrap,
        printMargin: props.printMargin,
        useWorker: false,
        minLines: props.minLines,
        maxLines: props.maxLines,
        ...props.options,
    }))

    const resourceObserver = new ResizeObserver(() => _editor.resize());
    resourceObserver.observe(editorRef)

    _editor.on('change', () => {
        const content = _editor.getValue()
        emit('update:value', content);
    })

    emit('init', _editor)
})

onUnmounted(() => {
    editor.value?.destroy()
    editor.value?.container.remove();
})

</script>


<template >
    <div :id="props.id" class="editor"></div>
</template>


<style scoped>
.editor {
    height: 800px;
}
</style>
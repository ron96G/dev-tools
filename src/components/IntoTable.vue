<script setup lang="ts">
import { Ref, ref, watch } from 'vue';

const infos: Ref<Array<any>> = ref([])

const props = defineProps({
    infos: {
        type: Array<{
            severity: string
            code: string | number,
            message: string
        }>,
        default: []
    }
})

const emit = defineEmits(['jumpToLine'])

watch(() => props.infos, (newInfos) => {
    infos.value = newInfos
})
</script>

<template>
    <div id="notification-wrapper">
        <table v-if="props.infos.length > 0">
            <tr>
                <th class="column">Level</th>
                <th class="column">Message</th>
                <th class="column">Jump To Line</th>
            </tr>
            <template v-for="item in infos">
                <tr>
                    <td class="column"> {{ item.severity.toUpperCase() }} </td>
                    <td class="column" style="max-width: 60vw;"> {{ item.message }} ({{ item.code }})</td>
                    <td class="column" style="max-width: 5vw;"> <scale-button @click="emit('jumpToLine', item.start.line)">
                            Jump </scale-button>
                    </td>
                </tr>
            </template>
        </table>
    </div>
</template>


<style scoped>
#notification-wrapper {
    padding-top: 20px;
    max-height: 34vh;
    overflow: auto;
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
    background-color: var(--telekom-color-background-surface-subtle);
}

table {
    width: 100%;
    border-collapse: collapse;
}

.column {
    text-align: start;
    padding-left: 5px;
}
</style>
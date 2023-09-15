<script setup lang="ts">
import { ref } from 'vue';



const output = ref("foo")

async function onChange(e: any) {
    try {
        const value = e.detail.value.trim()
    } catch (e) {
        console.log(e)
    }

}

</script>



<template>
    <div id="beautifier-wrapper">
        <div id="content">
            <div id="input-side">
                <scale-textarea rows=30 label="OpenApi (json/yaml)" @scaleChange="onChange"></scale-textarea>
            </div>

            <div id="output-side">
                <scale-textarea rows=30 class="whole-screen-ta" label="Validation Output" v-bind="output"></scale-textarea>
            </div>
        </div>
    </div>
</template>


<style scoped>
#beautifier-wrapper {
    position: relative;
    top: 10rem;
}

#content {
    display: grid;
    grid-template-columns: 49% 2% 49%;
    grid-template-rows: 100%;

}

#input-side {
    grid-column-start: 1;
}

#output-side {
    grid-column-start: 3;
}
</style>
<script setup lang="ts">
import { ref, type Ref } from 'vue';
import LoadingOverlay from './components/LoadingOverlay.vue';
import LightDarkModeSwitch from './components/LightDarkModeSwitch.vue';
import Notifications from './components/Notifications.vue';
import OpenAPIValidator from './views/OpenAPIValidator.vue';
import Beautifier from './views/Beautifier.vue';

import type { Event } from './libs/common';


let showGraph: Ref<boolean> = ref(false);
let progress: Ref<number> = ref(0);
let loading: Ref<boolean> = ref(false);
let logs: Ref<Array<string>> = ref([]);
let errors: Ref<Array<string>> = ref([])

function onProgress(p: number) {
  loading.value = true
  progress.value = p > 100 ? 100 : p
}


function onLogs(e: Event) {
  console.log(`${e.level}: ${e.message}`)
  if (e.level === 'error') {
    console.log('received error')
    errors.value.push(e.message)
  } else {
    logs.value.push(`${e.level}: ${e.message}`)
  }
}

</script>

<template>
  <main>
    <LightDarkModeSwitch />
    <Notifications :in-errors="errors" />

    <LoadingOverlay v-if="loading" :progress="progress" type="progressbar" :logs="logs" />

    <OpenAPIValidator></OpenAPIValidator>


    <!-- <Beautifier></Beautifier> -->

  </main>
</template>



<style>
.unselectable {
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
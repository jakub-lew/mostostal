<template>
    <div class="flex flex-col w-full">
        <Button @click="getValue"></Button>
        <div id="editor" style="height: 500px; width: 100%;"></div>
    </div>
</template>

<script lang="ts" setup>

import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-twilight';
import { onMounted, ref } from 'vue';

const editor = ref<ace.Editor | null>(null);


onMounted(() => {
    editor.value = ace.edit("editor");
    editor.value.setTheme("ace/theme/monokai");
    editor.value.session.setMode("ace/mode/javascript");
});

function getValue() {
    return editor.value?.getValue();
}   
</script>
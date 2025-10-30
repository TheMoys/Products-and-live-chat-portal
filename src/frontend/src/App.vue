<!-- filepath: src/frontend/src/App.vue -->
<template>
    <div id="app">
        <RouterView />
    </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
/* Estilos globales básicos */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
}
</style>
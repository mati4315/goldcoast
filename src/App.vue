<script setup>
import MainLayout from './layouts/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <router-view></router-view>
  </MainLayout>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #000;
}

a {
  color: #2196F3;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
</style>

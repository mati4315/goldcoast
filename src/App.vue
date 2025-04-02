<script setup>
import { ref, reactive } from 'vue';
import AppHeader from './components/AppHeader.vue';
import MainLayout from './layouts/MainLayout.vue'

const headerRef = ref(null);
const configurations = reactive({
  language: 'es',
  showTimestamps: true
});

const updateConfigurations = (newConfigs) => {
  Object.assign(configurations, newConfigs);
};
</script>

<template>
  <div class="app">
    <AppHeader 
      ref="headerRef" 
      @update:configurations="updateConfigurations"
    />
    <MainLayout>
      <router-view :configurations="configurations"></router-view>
    </MainLayout>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  background-color: black;
  color: white;
}

/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  background-color: black;
  color: white;
}

html, body {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
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

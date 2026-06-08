<template>
  <nav class="navbar">
    <span class="navbar-brand">ClínicaApp</span>
    <div class="navbar-links">
      <RouterLink to="/"          class="nav-link">Inicio</RouterLink>
      <RouterLink to="/citas"     class="nav-link">Citas</RouterLink>
      <RouterLink to="/historial" class="nav-link">Historial</RouterLink>
    </div>
  </nav>

  <RouterView />

  <div class="toast-container">
    <div v-for="t in toasts" :key="t.id" :class="'toast toast-' + t.tipo">
      {{ t.mensaje }}
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { toasts } from './utils.js'
</script>

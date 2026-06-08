<template>
  <div class="pagina">
    <div class="home-hero">
      <h1>Sistema de Gestión Clínica</h1>
      <p>Administra citas médicas e historial clínico desde un solo lugar.</p>
    </div>
    <div class="home-cards">
      <RouterLink to="/citas" class="home-card">
        <h3>Citas Médicas</h3>
        <p>Registra, consulta, edita y cancela citas. Filtra por fecha, paciente o estado.</p>
      </RouterLink>
      <RouterLink to="/historial" class="home-card">
        <h3>Historial Clínico</h3>
        <p>Consulta evoluciones por paciente y registra nuevas entradas clínicas.</p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

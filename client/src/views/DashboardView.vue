<template>
  <div class="layout">
    <header class="topbar">
      <div>
        <h1>CheckPoint Salud</h1>
        <span class="subtitle">
          {{ auth.usuario?.nombre }} · <strong>{{ auth.rolActual }}</strong>
          <span v-if="auth.usuario?.empresa?.razonSocial"> ({{ auth.usuario.empresa.razonSocial }})</span>
        </span>
      </div>
      <button class="btn-logout" @click="salir">Cerrar Sesión</button>
    </header>

    <main class="container">
      <PanelOperario v-if="auth.rolActual === 'PACIENTE'" />
      <PanelEmpresa v-else-if="auth.rolActual === 'EMPRESA'" />
      <PanelRecepcion v-else-if="auth.rolActual === 'RECEPCION'" />
      <PanelMedico v-else-if="auth.rolActual === 'MEDICO'" />
      <PanelSuperAdmin v-else-if="auth.rolActual === 'SUPERADMIN'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.ts';
import PanelOperario from '../components/PanelOperario.vue';
import PanelEmpresa from '../components/PanelEmpresa.vue';
import PanelRecepcion from '../components/PanelRecepcion.vue';
import PanelMedico from '../components/PanelMedico.vue';
import PanelSuperAdmin from '../components/PanelSuperAdmin.vue';

const auth = useAuthStore();
const router = useRouter();

function salir() {
  auth.cerrarSesion();
  router.push('/login');
}
</script>

<style scoped>
.topbar {
  background: #0f172a;
  color: #fff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topbar h1 {
  font-size: 1.25rem;
}

.subtitle {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.btn-logout {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
<template>
  <div class="porteria-layout">
    <div class="porteria-card">
      <div class="brand-header">
        <span class="badge-sistema">CheckPoint Salud · Control de Acceso</span>
        <h1>Verificación de Aptitud Laboral</h1>
      </div>

      <form class="search-box" @submit.prevent="consultarDni">
        <input
          v-model="dniInput"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Ingrese DNI del operario..."
          required
        />
        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Verificando...' : 'Verificar' }}
        </button>
      </form>

      <div v-if="errorMsg" class="alert-error">
        <strong>Acceso Denegado:</strong> {{ errorMsg }}
      </div>

      <div v-if="datos" class="resultado-box">
        <div :class="['estado-banner', datos.vigente ? 'estado-ok' : 'estado-no']">
          {{ datos.vigente ? 'HABILITADO PARA INGRESO (APTO VIGENTE)' : 'NO HABILITADO / VENCIDO' }}
        </div>

        <ul class="datos-lista">
          <li><span>Operario:</span> <strong>{{ datos.operario }}</strong></li>
          <li><span>DNI:</span> <strong>{{ datos.dni }}</strong></li>
          <li><span>Empresa:</span> <strong>{{ datos.empresa }}</strong></li>
          <li><span>Puesto:</span> <strong>{{ datos.puesto }}</strong></li>
          <li><span>Dictamen:</span> <strong>{{ datos.resultado }}</strong></li>
          <li><span>Vencimiento:</span> <strong>{{ formatearFecha(datos.fechaVencimiento) }}</strong></li>
        </ul>

        <p class="legal-note">
          Validación pública sin exposición de historia clínica conforme a la Ley N° 25.326.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const dniInput = ref('');
const cargando = ref(false);
const errorMsg = ref('');
const datos = ref<any>(null);

async function consultarDni() {
  if (!dniInput.value.trim()) return;
  cargando.value = true;
  errorMsg.value = '';
  datos.value = null;

  try {
    const res = await axios.get(`http://localhost:4000/api/public/verificar/${dniInput.value.trim()}`);
    datos.value = res.data.data;
  } catch (err: any) {
    errorMsg.value = err.response?.data?.error || 'No se encontró un certificado vigente para ese DNI.';
  } finally {
    cargando.value = false;
  }
}

function formatearFecha(fechaIso: string) {
  return new Date(fechaIso).toLocaleDateString('es-AR');
}

onMounted(() => {
  if (route.params.dni) {
    dniInput.value = String(route.params.dni);
    consultarDni();
  }
});
</script>

<style scoped>
.porteria-layout {
  min-height: 100vh;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}
.porteria-card {
  background: #ffffff;
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}
.brand-header {
  text-align: center;
  margin-bottom: 1.25rem;
}
.badge-sistema {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.brand-header h1 {
  font-size: 1.25rem;
  color: #0f172a;
  margin-top: 0.6rem;
}
.search-box {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.search-box input {
  flex: 1;
  min-width: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
}
.search-box button {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
}
.alert-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 0.9rem;
  border-radius: 8px;
  font-size: 0.9rem;
}
.estado-banner {
  text-align: center;
  font-weight: 700;
  padding: 0.85rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.92rem;
}
.estado-ok {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}
.estado-no {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}
.datos-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.datos-lista li {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.92rem;
}
.datos-lista li:last-child {
  border-bottom: none;
}
.datos-lista span {
  color: #64748b;
  flex-shrink: 0;
}
.datos-lista strong {
  text-align: right;
  word-break: break-word;
}
.legal-note {
  margin-top: 1rem;
  font-size: 0.78rem;
  color: #64748b;
  text-align: center;
}

/* Ajuste específico para celulares muy angostos (< 380px) */
@media (max-width: 380px) {
  .porteria-card {
    padding: 1.15rem;
  }
  .search-box {
    flex-direction: column;
  }
  .search-box button {
    padding: 0.75rem;
    width: 100%;
  }
}
</style>
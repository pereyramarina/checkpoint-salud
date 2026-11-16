<template>
  <div class="grid-2">
    <!-- Emisión de Apto Médico -->
    <div class="card">
      <h2>Emitir Certificado de Aptitud</h2>
      <form @submit.prevent="emitirApto" class="form">
        <label>Turno a Evaluar</label>
        <select v-model="form.turnoId" required>
          <option value="" disabled>Seleccione turno pendiente...</option>
          <option v-for="t in turnosPendientes" :key="t.id" :value="t.id">
            {{ t.paciente.nombreCompleto }} (DNI {{ t.paciente.dni }}) — {{ t.puesto.nombrePuesto }}
          </option>
        </select>

        <label>Dictamen de Aptitud</label>
        <select v-model="form.resultado" required>
          <option value="APTO">APTO</option>
          <option value="APTO_CON_PREEXISTENCIAS">APTO CON PREEXISTENCIAS</option>
          <option value="NO_APTO">NO APTO</option>
        </select>

        <label>Detalle Clínico Confidencial (Secreto Médico)</label>
        <textarea
          v-model="form.detalleClinico"
          rows="4"
          placeholder="Observaciones de laboratorio, audiometría, ECG, radiología..."
          required
        ></textarea>

        <button type="submit" class="btn btn-primary">Firmar y Emitir Apto</button>
      </form>
    </div>

    <!-- Historial con Detalle Clínico -->
    <div class="card">
      <h2>Historial Clínico Emitido</h2>

      <div v-if="aptos.length > 0" class="filter-bar">
        <input
          v-model="busquedaHistorial"
          type="text"
          placeholder="Filtrar por operario, DNI o resultado..."
        />
      </div>

      <div v-if="aptos.length === 0" class="muted">No hay certificados emitidos todavía.</div>
      <div v-else-if="aptosFiltrados.length === 0" class="muted">
        No se encontraron registros que coincidan con "{{ busquedaHistorial }}".
      </div>

      <div v-for="a in aptosFiltrados" :key="a.id" class="item-box">
        <div class="item-header">
          <strong>{{ a.paciente.nombreCompleto }} (DNI {{ a.paciente.dni }})</strong>
          <span class="badge">{{ a.resultado }}</span>
        </div>
        <p class="clinico"><strong>Informe Médico:</strong> {{ a.detalleClinico }}</p>
        <p class="muted">Vence: {{ new Date(a.fechaVencimiento).toLocaleDateString('es-AR') }}</p>

        <div class="cert-actions">
          <router-link
            :to="`/verificar/${a.paciente.dni}`"
            target="_blank"
            class="btn btn-outline"
          >
            Verificar Portería
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import http from '../api/http';

const turnos = ref<any[]>([]);
const aptos = ref<any[]>([]);
const busquedaHistorial = ref('');

const form = ref({
  turnoId: '',
  resultado: 'APTO',
  detalleClinico: '',
});

const turnosPendientes = computed(() =>
  turnos.value.filter((t) => t.estado !== 'ATENDIDO' && t.estado !== 'CANCELADO')
);

const aptosFiltrados = computed(() => {
  const q = busquedaHistorial.value.trim().toLowerCase();
  if (!q) return aptos.value;
  return aptos.value.filter(
    (a) =>
      a.paciente.nombreCompleto.toLowerCase().includes(q) ||
      String(a.paciente.dni).includes(q) ||
      a.resultado.toLowerCase().includes(q)
  );
});

async function cargarDatos() {
  const [resTur, resApt] = await Promise.all([http.get('/turnos'), http.get('/aptos')]);
  turnos.value = resTur.data.data;
  aptos.value = resApt.data.data;
}

async function emitirApto() {
  await http.post('/aptos/emitir', form.value);
  form.value.turnoId = '';
  form.value.detalleClinico = '';
  await cargarDatos();
}

onMounted(cargarDatos);
</script>

<style scoped>
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: 1.5rem; }
.card { background: #fff; padding: 1.5rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
h2 { font-size: 1.15rem; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
.filter-bar { margin-bottom: 0.9rem; }
.filter-bar input { width: 100%; padding: 0.55rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.form { display: flex; flex-direction: column; gap: 0.75rem; }
label { font-size: 0.85rem; font-weight: 600; }
select, textarea, input { padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; width: 100%; box-sizing: border-box; }
.item-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.9rem; margin-bottom: 0.75rem; }
.item-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
.badge { background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.clinico { background: #f8fafc; padding: 0.5rem; border-left: 3px solid #2563eb; margin: 0.4rem 0; font-size: 0.88rem; word-break: break-word; }
.cert-actions { margin-top: 0.6rem; }
.btn { display: inline-block; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; text-decoration: none; }
.btn-primary { width: 100%; padding: 0.65rem; background: #1d4ed8; color: #fff; font-size: 0.88rem; }
.btn-outline { padding: 0.45rem 0.8rem; background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; font-size: 0.82rem; }
.muted { color: #64748b; font-size: 0.82rem; }
</style>
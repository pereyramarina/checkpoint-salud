<template>
  <div class="grid-2">
    <!-- Proponer Turno -->
    <div class="card">
      <h2>Asignar / Proponer Nuevo Turno</h2>
      <form @submit.prevent="crearTurno" class="form">
        <label>Operario</label>
        <select v-model="form.pacienteId" required>
          <option value="" disabled>Seleccione un operario...</option>
          <option v-for="p in pacientes" :key="p.id" :value="p.id">
            {{ p.nombreCompleto }} — DNI {{ p.dni }} ({{ p.empresa.razonSocial }})
          </option>
        </select>

        <label>Puesto Laboral</label>
        <select v-model="form.puestoId" required>
          <option value="" disabled>Seleccione puesto...</option>
          <option v-for="pu in puestos" :key="pu.id" :value="pu.id">
            {{ pu.nombrePuesto }} (Vigencia: {{ pu.vigenciaMeses }} meses)
          </option>
        </select>

        <label>Sede Clínica</label>
        <select v-model="form.sede" required>
          <option value="NEUQUEN_CAPITAL">Neuquén Capital</option>
          <option value="RINCON_DE_LOS_SAUCES">Rincón de los Sauces</option>
        </select>

        <label>Fecha y Hora</label>
        <input v-model="form.fechaHora" type="datetime-local" required />

        <button type="submit" class="btn btn-primary">Proponer Turno</button>
      </form>
    </div>

    <!-- Agenda General -->
    <div class="card">
      <h2>Agenda de Turnos</h2>

      <div v-if="turnos.length > 0" class="filter-bar">
        <input
          v-model="busquedaAgenda"
          type="text"
          placeholder="Filtrar por operario, DNI o empresa..."
        />
      </div>

      <div v-if="turnos.length === 0" class="muted">No hay turnos registrados.</div>
      <div v-else-if="turnosFiltrados.length === 0" class="muted">
        No se encontraron turnos que coincidan con "{{ busquedaAgenda }}".
      </div>

      <div v-for="t in turnosFiltrados" :key="t.id" class="item-box">
        <div class="item-header">
          <strong>{{ t.paciente.nombreCompleto }} ({{ t.empresa.razonSocial }})</strong>
          <span class="badge">{{ t.estado }}</span>
        </div>
        <p>
          {{ t.puesto.nombrePuesto }} · {{ new Date(t.fechaHora).toLocaleString('es-AR') }}
          <br /><strong>Sede:</strong> {{ formatearSede(t.sede) }}
        </p>
        <p v-if="t.motivoCambioFecha" class="alerta">Motivo cambio: {{ t.motivoCambioFecha }}</p>

        <div class="turn-actions">
          <router-link
            :to="`/verificar/${t.paciente.dni}`"
            target="_blank"
            class="btn btn-outline"
          >
            Verificar Portería
          </router-link>
        </div>

        <div v-if="t.estado === 'REPROGRAMACION_SOLICITADA'" class="reprog">
          <input v-model="nuevasFechas[t.id]" type="datetime-local" />
          <button class="btn btn-warning" @click="reasignar(t.id)">Reasignar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import http from '../api/http';

const pacientes = ref<any[]>([]);
const puestos = ref<any[]>([]);
const turnos = ref<any[]>([]);
const busquedaAgenda = ref('');
const nuevasFechas = ref<Record<string, string>>({});

const form = ref({
  pacienteId: '',
  puestoId: '',
  sede: 'NEUQUEN_CAPITAL',
  fechaHora: '',
});

const turnosFiltrados = computed(() => {
  const q = busquedaAgenda.value.trim().toLowerCase();
  if (!q) return turnos.value;
  return turnos.value.filter(
    (t) =>
      t.paciente.nombreCompleto.toLowerCase().includes(q) ||
      String(t.paciente.dni).includes(q) ||
      t.empresa.razonSocial.toLowerCase().includes(q)
  );
});

const formatearSede = (sede: string) => {
  const etiquetas: Record<string, string> = {
    NEUQUEN_CAPITAL: 'Neuquén Capital',
    RINCON_DE_LOS_SAUCES: 'Rincón de los Sauces',
  };
  return etiquetas[sede] || sede;
};

async function cargarDatos() {
  const [resPac, resPue, resTur] = await Promise.all([
    http.get('/pacientes'),
    http.get('/puestos'),
    http.get('/turnos'),
  ]);
  pacientes.value = resPac.data.data;
  puestos.value = resPue.data.data;
  turnos.value = resTur.data.data;
}

async function crearTurno() {
  await http.post('/turnos/proponer', {
    ...form.value,
    fechaHora: new Date(form.value.fechaHora).toISOString(),
  });
  form.value.pacienteId = '';
  form.value.fechaHora = '';
  await cargarDatos();
}

async function reasignar(id: string) {
  const fecha = nuevasFechas.value[id];
  if (!fecha) return;
  await http.patch(`/turnos/${id}/reprogramar-clinica`, {
    nuevaFechaHora: new Date(fecha).toISOString(),
  });
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
input, select { padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; width: 100%; }
.item-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.9rem; margin-bottom: 0.75rem; }
.item-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.3rem; }
.badge { background: #dbeafe; color: #1e40af; padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.alerta { color: #b45309; font-size: 0.85rem; margin-top: 0.3rem; font-weight: 600; }
.turn-actions { margin-top: 0.6rem; }
.reprog { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
.reprog input { flex: 1; min-width: 0; }
.btn { display: inline-block; padding: 0.55rem 0.9rem; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; text-decoration: none; }
.btn-primary { background: #1d4ed8; color: #fff; }
.btn-warning { background: #f59e0b; color: #fff; }
.btn-outline { background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; }
.muted { color: #64748b; font-size: 0.88rem; }
</style>
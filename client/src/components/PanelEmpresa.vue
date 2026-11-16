<template>
  <div class="stack">
    <!-- KPIs de Compliance -->
    <div v-if="stats" class="kpi-grid">
      <div class="kpi"><span>Dotación Evaluada</span><strong>{{ stats.totalDotacion }}</strong></div>
      <div class="kpi"><span>Aptos Vigentes</span><strong class="ok">{{ stats.aptosAlDia }}</strong></div>
      <div class="kpi"><span>Por Vencer (30d)</span><strong class="warn">{{ stats.proximosAVencer30Dias }}</strong></div>
      <div class="kpi"><span>Compliance</span><strong>{{ stats.indiceCompliancePorcentaje }}%</strong></div>
    </div>

    <div class="grid-2">
      <!-- Carga Masiva Excel -->
      <div class="card">
        <h2>Carga Masiva de Dotación (.xlsx)</h2>
        <p class="muted">Descarga la plantilla oficial, completa DNI, CUIL, Nombre y Teléfono, y súbela aquí.</p>
        <div class="actions">
          <button class="btn btn-secondary" @click="descargarPlantilla">Descargar Plantilla Excel</button>
        </div>
        <div class="upload-box">
          <input type="file" accept=".xlsx" @change="seleccionarArchivo" />
          <button class="btn btn-primary" :disabled="!archivo || subiendo" @click="subirExcel">
            {{ subiendo ? 'Procesando...' : 'Subir Nómina' }}
          </button>
        </div>
        <div v-if="reporteCarga" class="reporte">
          <p><strong>Procesados:</strong> {{ reporteCarga.resumen.totalFilasProcesadas }}</p>
          <p><strong>Nuevos:</strong> {{ reporteCarga.resumen.nuevosIngresos }} | <strong>Actualizados:</strong> {{ reporteCarga.resumen.registrosActualizados }}</p>
          <p v-if="reporteCarga.resumen.filasConError > 0" class="err">
            Errores: {{ reporteCarga.resumen.filasConError }}
          </p>
        </div>
      </div>

      <!-- Aprobación de Turnos -->
      <div class="card">
        <h2>Turnos de Mi Dotación</h2>

        <div v-if="turnos.length > 0" class="filter-bar">
          <input
            v-model="busquedaTurno"
            type="text"
            placeholder="Filtrar por DNI o nombre del operario..."
          />
        </div>

        <div v-if="turnos.length === 0" class="muted">No hay turnos registrados.</div>
        <div v-else-if="turnosFiltrados.length === 0" class="muted">
          No se encontraron operarios que coincidan con "{{ busquedaTurno }}".
        </div>

        <div v-for="t in turnosFiltrados" :key="t.id" class="item-box">
          <div class="item-header">
            <strong>{{ t.paciente.nombreCompleto }} (DNI {{ t.paciente.dni }})</strong>
            <span class="badge">{{ t.estado }}</span>
          </div>
          <p>{{ t.puesto.nombrePuesto }} — {{ new Date(t.fechaHora).toLocaleString('es-AR') }} ({{ formatearSede(t.sede) }})</p>
          <div class="actions">
            <button
              v-if="t.estado === 'PROPUESTO_CLINICA'"
              class="btn btn-success"
              @click="aprobarTurno(t.id)"
            >
              Aprobar Turno (RRHH)
            </button>
            <router-link
              :to="`/verificar/${t.paciente.dni}`"
              target="_blank"
              class="btn btn-outline"
            >
              Verificar Portería
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import http from '../api/http';

const stats = ref<any>(null);
const turnos = ref<any[]>([]);
const busquedaTurno = ref('');
const archivo = ref<File | null>(null);
const subiendo = ref(false);
const reporteCarga = ref<any>(null);

const turnosFiltrados = computed(() => {
  const q = busquedaTurno.value.trim().toLowerCase();
  if (!q) return turnos.value;
  return turnos.value.filter(
    (t) =>
      t.paciente.nombreCompleto.toLowerCase().includes(q) ||
      String(t.paciente.dni).includes(q)
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
  const [resComp, resTurnos] = await Promise.all([
    http.get('/compliance'),
    http.get('/turnos'),
  ]);
  stats.value = resComp.data.data.resumenGeneral;
  turnos.value = resTurnos.data.data;
}

function seleccionarArchivo(e: Event) {
  const target = e.target as HTMLInputElement;
  archivo.value = target.files?.[0] || null;
}

async function descargarPlantilla() {
  const response = await http.get('/operarios/plantilla-excel', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Plantilla_Operarios_CheckPoint.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function subirExcel() {
  if (!archivo.value) return;
  subiendo.value = true;
  try {
    const formData = new FormData();
    formData.append('archivo', archivo.value);
    const { data } = await http.post('/operarios/carga-masiva', formData);
    reporteCarga.value = data.data;
    await cargarDatos();
  } finally {
    subiendo.value = false;
  }
}

async function aprobarTurno(id: string) {
  await http.patch(`/turnos/${id}/aprobar-empresa`);
  await cargarDatos();
}

onMounted(cargarDatos);
</script>

<style scoped>
.stack { display: flex; flex-direction: column; gap: 1.5rem; }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
.kpi { background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
.kpi span { font-size: 0.8rem; color: #64748b; }
.kpi strong { font-size: 1.6rem; color: #0f172a; margin-top: 0.25rem; }
.kpi strong.ok { color: #16a34a; }
.kpi strong.warn { color: #d97706; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: 1.5rem; }
.card { background: #fff; padding: 1.5rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
h2 { font-size: 1.15rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
.filter-bar { margin-bottom: 0.9rem; }
.filter-bar input { width: 100%; padding: 0.55rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.upload-box { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; padding: 1rem; border: 1px dashed #94a3b8; border-radius: 8px; }
.upload-box input { max-width: 100%; }
.reporte { margin-top: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; font-size: 0.85rem; }
.item-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.9rem; margin-bottom: 0.75rem; }
.item-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
.badge { background: #e0e7ff; color: #1e40af; padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem; }
.btn { display: inline-block; padding: 0.5rem 0.9rem; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; text-decoration: none; }
.btn-primary { background: #1d4ed8; color: #fff; }
.btn-secondary { background: #e2e8f0; color: #0f172a; }
.btn-success { background: #16a34a; color: #fff; }
.btn-outline { background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; }
.muted { color: #64748b; font-size: 0.88rem; }
.err { color: #dc2626; font-weight: 600; }
</style>
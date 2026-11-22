<template>
  <div class="space-y-8">
    <!-- KPIs de Compliance -->
    <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Dotación Evaluada</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.totalDotacion }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Aptos Vigentes</p>
          <p class="text-2xl font-bold text-emerald-600 mt-1">{{ stats.aptosAlDia }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <ShieldCheck class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Por Vencer (30d)</p>
          <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.proximosAVencer30Dias }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Índice Compliance</p>
          <p class="text-2xl font-bold text-sky-600 mt-1">{{ stats.indiceCompliancePorcentaje }}%</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <TrendingUp class="w-5 h-5" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Carga Masiva Excel -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Carga Masiva de Dotación</h2>
            <p class="text-xs text-slate-500">Importación de nómina mediante archivo Excel (.xlsx)</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <p class="text-xs text-slate-600 leading-relaxed">
            Descargá la plantilla oficial, completá <strong>DNI, CUIL, Nombre y Teléfono</strong> de tus operarios y subila para sincronizar el padrón corporativo.
          </p>

          <button
            type="button"
            @click="descargarPlantilla"
            class="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download class="w-4 h-4 text-slate-500" />
            <span>Descargar Plantilla Oficial (.xlsx)</span>
          </button>

          <!-- Selector de archivo limpio (Dropzone único) -->
          <div class="space-y-3">
            <label
              @dragover.prevent="arrastrando = true"
              @dragleave.prevent="arrastrando = false"
              @drop.prevent="soltarArchivo"
              :class="[
                'flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center',
                arrastrando
                  ? 'border-sky-500 bg-sky-50/60'
                  : archivo
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50'
              ]"
            >
              <input
                ref="inputArchivo"
                type="file"
                accept=".xlsx"
                @change="seleccionarArchivo"
                class="hidden"
              />

              <div
                :class="[
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors',
                  archivo ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 shadow-2xs'
                ]"
              >
                <FileCheck2 v-if="archivo" class="w-5 h-5" />
                <FileUp v-else class="w-5 h-5" />
              </div>

              <template v-if="archivo">
                <p class="text-xs font-semibold text-slate-900 truncate max-w-full px-2">
                  {{ archivo.name }}
                </p>
                <p class="text-[11px] text-emerald-700 font-medium mt-0.5">
                  Listo para importar · Hacé clic para cambiar
                </p>
              </template>
              <template v-else>
                <p class="text-xs font-semibold text-slate-800">
                  Seleccionar archivo (.xlsx)
                </p>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  O arrastralo y soltalo en este recuadro
                </p>
              </template>
            </label>

            <button
              type="button"
              :disabled="!archivo || subiendo"
              @click="subirExcel"
              class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload class="w-4 h-4" />
              <span>{{ subiendo ? 'Procesando nómina...' : 'Subir y Sincronizar Nómina' }}</span>
            </button>
          </div>

          <div v-if="reporteCarga" class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div class="flex items-center justify-between font-semibold text-slate-900">
              <span>Resumen de Importación</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                {{ reporteCarga.resumen.totalFilasProcesadas }} filas
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1 text-slate-600">
              <p>Nuevos ingresos: <strong class="text-slate-900">{{ reporteCarga.resumen.nuevosIngresos }}</strong></p>
              <p>Actualizados: <strong class="text-slate-900">{{ reporteCarga.resumen.registrosActualizados }}</strong></p>
            </div>
            <p v-if="reporteCarga.resumen.filasConError > 0" class="text-rose-600 font-semibold pt-1">
              Filas con error: {{ reporteCarga.resumen.filasConError }}
            </p>
          </div>
        </div>
      </div>

      <!-- Aprobación y Seguimiento de Turnos -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <CalendarCheck class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-slate-900">Turnos de Mi Dotación</h2>
              <p class="text-xs text-slate-500">Aprobación RRHH y verificación de estado en portería</p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 self-start sm:self-auto">
            {{ turnosFiltrados.length }} {{ turnosFiltrados.length === 1 ? 'registro' : 'registros' }}
          </span>
        </div>

        <div class="p-6 space-y-4">
          <div v-if="turnos.length > 0" class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="busquedaTurno"
              type="text"
              placeholder="Filtrar por DNI o nombre del operario..."
              class="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div v-if="turnos.length === 0" class="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No hay turnos registrados para esta empresa.
          </div>
          <div v-else-if="turnosFiltrados.length === 0" class="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No se encontraron operarios que coincidan con "{{ busquedaTurno }}".
          </div>

          <div
            v-for="t in turnosFiltrados"
            :key="t.id"
            class="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white transition-colors space-y-3"
          >
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ t.paciente.nombreCompleto }}</h3>
                <p class="text-xs text-slate-500 font-mono mt-0.5">DNI {{ t.paciente.dni }}</p>
              </div>
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold border', badgeEstado(t.estado)]">
                {{ t.estado }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
              <span><strong>Puesto:</strong> {{ t.puesto.nombrePuesto }}</span>
              <span>·</span>
              <span>{{ new Date(t.fechaHora).toLocaleString('es-AR') }}</span>
              <span>·</span>
              <span>{{ formatearSede(t.sede) }}</span>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap pt-1">
              <button
                v-if="t.estado === 'PROPUESTO_CLINICA'"
                @click="aprobarTurno(t.id)"
                class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                Aprobar Turno (RRHH)
              </button>
              <router-link
                :to="`/verificar/${t.paciente.dni}`"
                target="_blank"
                class="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <ExternalLink class="w-3.5 h-3.5 text-slate-500" />
                Verificar Portería
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  FileUp,
  FileCheck2,
  Download,
  Upload,
  CalendarCheck,
  Search,
  CheckCircle2,
  ExternalLink,
} from 'lucide-vue-next';
import http from '../api/http';

const stats = ref<any>(null);
const turnos = ref<any[]>([]);
const busquedaTurno = ref('');
const archivo = ref<File | null>(null);
const arrastrando = ref(false);
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

function badgeEstado(estado: string) {
  if (estado === 'CONFIRMADO' || estado === 'ATENDIDO') return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  if (estado === 'PROPUESTO_CLINICA' || estado === 'REPROGRAMACION_SOLICITADA') return 'bg-amber-50 text-amber-700 border-amber-200/80';
  if (estado === 'CANCELADO') return 'bg-rose-50 text-rose-700 border-rose-200/80';
  return 'bg-sky-50 text-sky-700 border-sky-200/80';
}

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

function soltarArchivo(e: DragEvent) {
  arrastrando.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file && file.name.endsWith('.xlsx')) {
    archivo.value = file;
  }
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
<template>
  <div class="space-y-8">
    <!-- Métricas del Consultorio (íconos sueltos sin cajita de fondo) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Pendientes de Evaluación</p>
          <p class="text-2xl font-bold text-amber-600 mt-1">{{ turnosPendientes.length }}</p>
        </div>
        <ClipboardList class="w-6 h-6 text-amber-500 shrink-0" />
      </div>

      <div class="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Certificados Emitidos</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ aptos.length }}</p>
        </div>
        <FileCheck2 class="w-6 h-6 text-sky-600 shrink-0" />
      </div>

      <div class="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Privacidad Clínica</p>
          <p class="text-sm font-bold text-emerald-700 mt-1.5">Ley N° 25.326 Activa</p>
        </div>
        <Lock class="w-6 h-6 text-emerald-600 shrink-0" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Columna Izquierda: Emisión de Apto Médico (oculta al imprimir) -->
      <div class="no-print lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <Stethoscope class="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Emitir Certificado de Aptitud</h2>
            <p class="text-xs text-slate-500">Firma médica y generación automática de credencial QR</p>
          </div>
        </div>

        <form @submit.prevent="emitirApto" class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">Turno a Evaluar</label>
            <select
              v-model="form.turnoId"
              required
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option value="" disabled>Seleccione turno pendiente...</option>
              <option v-for="t in turnosPendientes" :key="t.id" :value="t.id">
                {{ t.paciente.nombreCompleto }} (DNI {{ t.paciente.dni }}) — {{ t.puesto.nombrePuesto }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">Dictamen de Aptitud</label>
            <select
              v-model="form.resultado"
              required
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option value="APTO">APTO (Sin restricciones)</option>
              <option value="APTO_CON_PREEXISTENCIAS">APTO CON PREEXISTENCIAS</option>
              <option value="NO_APTO">NO APTO</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-slate-700">Detalle Clínico Confidencial</label>
              <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Lock class="w-3 h-3 text-sky-600" /> Secreto Médico
              </span>
            </div>
            <textarea
              v-model="form.detalleClinico"
              rows="4"
              placeholder="Observaciones de laboratorio, audiometría, ECG, radiología..."
              required
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-y"
            ></textarea>
            <p class="text-[11px] text-slate-400">
              Este informe queda protegido en historia clínica y nunca se expone a empresas ni portería.
            </p>
          </div>

          <div class="pt-2 space-y-3">
            <button
              type="submit"
              :disabled="emitiendo"
              class="btn-interactive group w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSignature class="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>{{ emitiendo ? 'Firmando certificado...' : 'Firmar y Emitir Apto' }}</span>
            </button>

            <div v-if="msgOk" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{{ msgOk }}</span>
            </div>
          </div>
        </form>
      </div>

      <!-- Columna Derecha: Historial Clínico Emitido -->
      <div class="lg:col-span-7 print:col-span-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print-clean-card">
        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <FolderHeart class="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h2 class="text-sm font-semibold text-slate-900">Historial Clínico Emitido</h2>
              <p class="text-xs text-slate-500">Registro confidencial de evaluaciones realizadas</p>
            </div>
          </div>

          <div class="no-print flex items-center gap-2 flex-wrap">
            <button
              v-if="aptosFiltrados.length > 0"
              type="button"
              @click="exportarAptosExcel"
              class="btn-secondary group px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
              <span>Exportar Excel</span>
            </button>

            <button
              v-if="aptosFiltrados.length > 0"
              type="button"
              @click="imprimirHistorial"
              class="btn-secondary group px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer class="w-3.5 h-3.5 text-sky-600 transition-transform duration-200 group-hover:scale-110" />
              <span>Imprimir / PDF</span>
            </button>

            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {{ aptosFiltrados.length }} {{ aptosFiltrados.length === 1 ? 'registro' : 'registros' }}
            </span>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <!-- Buscador -->
          <div v-if="aptos.length > 0" class="no-print relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="busquedaHistorial"
              type="text"
              placeholder="Filtrar por operario, DNI o resultado..."
              class="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div v-if="aptos.length === 0" class="p-8 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No hay certificados emitidos todavía.
          </div>
          <div v-else-if="aptosFiltrados.length === 0" class="p-8 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No se encontraron registros que coincidan con "{{ busquedaHistorial }}".
          </div>

          <div
            v-for="a in aptosFiltrados"
            :key="a.id"
            class="card-interactive p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white space-y-3"
          >
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ a.paciente.nombreCompleto }}</h3>
                <p class="text-xs text-slate-500 font-mono mt-0.5">DNI {{ a.paciente.dni }}</p>
              </div>
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold border', badgeResultado(a.resultado)]">
                {{ formatearResultado(a.resultado) }}
              </span>
            </div>

            <!-- Bloque Informe Médico Confidencial -->
            <div class="p-3 rounded-xl bg-slate-100/80 border-l-4 border-sky-500 text-xs text-slate-700 space-y-1">
              <p class="font-semibold text-slate-900 flex items-center gap-1.5">
                <Lock class="w-3 h-3 text-sky-600" /> Informe Médico:
              </p>
              <p class="leading-relaxed break-words">{{ a.detalleClinico }}</p>
            </div>

            <div class="flex items-center justify-between gap-3 pt-1 text-xs">
              <span class="text-slate-500">
                Vencimiento: <strong class="text-slate-800">{{ new Date(a.fechaVencimiento).toLocaleDateString('es-AR') }}</strong>
              </span>

              <router-link
                :to="`/verificar/${a.paciente.dni}`"
                target="_blank"
                class="no-print btn-secondary group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold"
              >
                <ExternalLink class="w-3.5 h-3.5 text-sky-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span>Verificar Portería</span>
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
import * as XLSX from 'xlsx';
import {
  ClipboardList,
  FileCheck2,
  Lock,
  Stethoscope,
  FileSignature,
  FolderHeart,
  Search,
  ExternalLink,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
} from 'lucide-vue-next';
import http from '../api/http';

const turnos = ref<any[]>([]);
const aptos = ref<any[]>([]);
const busquedaHistorial = ref('');
const emitiendo = ref(false);
const msgOk = ref('');

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

function formatearResultado(res: string) {
  const map: Record<string, string> = {
    APTO: 'APTO',
    APTO_CON_PREEXISTENCIAS: 'APTO C/ PREEXISTENCIAS',
    NO_APTO: 'NO APTO',
  };
  return map[res] || res;
}

function badgeResultado(res: string) {
  if (res === 'APTO') return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  if (res === 'APTO_CON_PREEXISTENCIAS') return 'bg-amber-50 text-amber-700 border-amber-200/80';
  return 'bg-rose-50 text-rose-700 border-rose-200/80';
}

async function cargarDatos() {
  const [resTur, resApt] = await Promise.all([http.get('/turnos'), http.get('/aptos')]);
  turnos.value = resTur.data.data;
  aptos.value = resApt.data.data;
}

async function emitirApto() {
  emitiendo.value = true;
  msgOk.value = '';
  try {
    await http.post('/aptos/emitir', form.value);
    form.value.turnoId = '';
    form.value.detalleClinico = '';
    msgOk.value = 'Certificado firmado y credencial QR generada correctamente.';
    await cargarDatos();
  } finally {
    emitiendo.value = false;
  }
}

function exportarAptosExcel() {
  const filas = aptosFiltrados.value.map((a) => ({
    Operario: a.paciente.nombreCompleto,
    DNI: a.paciente.dni,
    Dictamen: formatearResultado(a.resultado),
    Vencimiento: new Date(a.fechaVencimiento).toLocaleDateString('es-AR'),
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);
  hoja['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 24 }, { wch: 18 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Certificados_Emitidos');
  XLSX.writeFile(libro, `Certificados_Emitidos_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function imprimirHistorial() {
  window.print();
}

onMounted(cargarDatos);
</script>
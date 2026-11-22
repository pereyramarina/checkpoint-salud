<template>
  <div class="space-y-8">
    <!-- Métricas Rápidas de Recepción -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Turnos en Agenda</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ turnos.length }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <CalendarDays class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Reprogramaciones Solicitadas</p>
          <p class="text-2xl font-bold text-amber-600 mt-1">{{ cantidadReprogramaciones }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <RefreshCw class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Operarios en Padrón</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ pacientes.length }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Columna Izquierda: Proponer Turno -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CalendarPlus class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Asignar / Proponer Turno</h2>
            <p class="text-xs text-slate-500">Citación para examen preocupacional o periódico</p>
          </div>
        </div>

        <form @submit.prevent="crearTurno" class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">Operario</label>
            <select
              v-model="form.pacienteId"
              required
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option value="" disabled>Seleccione un operario...</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">
                {{ p.nombreCompleto }} — DNI {{ p.dni }} ({{ p.empresa.razonSocial }})
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">Puesto Laboral</label>
            <select
              v-model="form.puestoId"
              required
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option value="" disabled>Seleccione puesto...</option>
              <option v-for="pu in puestos" :key="pu.id" :value="pu.id">
                {{ pu.nombrePuesto }} (Vigencia: {{ pu.vigenciaMeses }} meses)
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">Sede Clínica</label>
            <select
              v-model="form.sede"
              required
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option value="NEUQUEN_CAPITAL">Neuquén Capital</option>
              <option value="RINCON_DE_LOS_SAUCES">Rincón de los Sauces</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Fecha</label>
              <input
                v-model="fechaSeleccionada"
                type="date"
                :min="fechaMinima"
                required
                class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Horario</label>
              <select
                v-model="horaSeleccionada"
                required
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option v-for="slot in horariosClinica" :key="slot" :value="slot">
                  {{ slot }} hs
                </option>
              </select>
            </div>
          </div>

          <div class="pt-2 space-y-3">
            <button
              type="submit"
              :disabled="creando"
              class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarPlus class="w-4 h-4" />
              <span>{{ creando ? 'Agendando...' : 'Proponer Turno' }}</span>
            </button>

            <div v-if="msgOk" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{{ msgOk }}</span>
            </div>
          </div>
        </form>
      </div>

      <!-- Columna Derecha: Agenda General -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <CalendarClock class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-slate-900">Agenda de Turnos</h2>
              <p class="text-xs text-slate-500">Seguimiento de citaciones y reprogramaciones</p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {{ turnosFiltrados.length }} {{ turnosFiltrados.length === 1 ? 'turno' : 'turnos' }}
          </span>
        </div>

        <div class="p-6 space-y-4">
          <!-- Buscador -->
          <div v-if="turnos.length > 0" class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="busquedaAgenda"
              type="text"
              placeholder="Filtrar por operario, DNI o empresa..."
              class="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div v-if="turnos.length === 0" class="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No hay turnos registrados en la agenda.
          </div>
          <div v-else-if="turnosFiltrados.length === 0" class="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No se encontraron turnos que coincidan con "{{ busquedaAgenda }}".
          </div>

          <div
            v-for="t in turnosFiltrados"
            :key="t.id"
            class="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white transition-colors space-y-3"
          >
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ t.paciente.nombreCompleto }}</h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ t.empresa.razonSocial }} · <span class="font-mono">DNI {{ t.paciente.dni }}</span>
                </p>
              </div>
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold border', badgeEstado(t.estado)]">
                {{ t.estado }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
              <div class="flex items-center gap-1.5">
                <Briefcase class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="truncate">{{ t.puesto.nombrePuesto }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{{ formatearFechaHora(t.fechaHora) }} hs</span>
              </div>
              <div class="flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{{ formatearSede(t.sede) }}</span>
              </div>
            </div>

            <!-- Alerta de motivo de cambio -->
            <div
              v-if="t.motivoCambioFecha"
              class="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2"
            >
              <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span class="font-semibold">Solicitud de cambio:</span> {{ t.motivoCambioFecha }}
              </div>
            </div>

            <!-- Reasignación de fecha y horario -->
            <div v-if="t.estado === 'REPROGRAMACION_SOLICITADA'" class="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 flex flex-col sm:flex-row gap-2">
              <input
                v-model="nuevasFechas[t.id]"
                type="date"
                :min="fechaMinima"
                class="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <select
                v-model="nuevasHoras[t.id]"
                class="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option v-for="slot in horariosClinica" :key="slot" :value="slot">
                  {{ slot }} hs
                </option>
              </select>
              <button
                @click="reasignar(t.id)"
                class="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Reasignar Fecha
              </button>
            </div>

            <div class="pt-1 flex items-center justify-end">
              <router-link
                :to="`/verificar/${t.paciente.dni}`"
                target="_blank"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all"
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
  CalendarDays,
  RefreshCw,
  Users,
  CalendarPlus,
  CalendarClock,
  Search,
  Briefcase,
  Clock,
  MapPin,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-vue-next';
import http from '../api/http';

const pacientes = ref<any[]>([]);
const puestos = ref<any[]>([]);
const turnos = ref<any[]>([]);
const busquedaAgenda = ref('');
const nuevasFechas = ref<Record<string, string>>({});
const nuevasHoras = ref<Record<string, string>>({});
const creando = ref(false);
const msgOk = ref('');

const fechaMinima = new Date().toISOString().split('T')[0];
const fechaSeleccionada = ref('');
const horaSeleccionada = ref('08:30');

// Franjas clínicas cada 15 minutos desde 07:00 hasta 18:30
const horariosClinica: string[] = [];
for (let h = 7; h <= 18; h++) {
  for (const m of [0, 15, 30, 45]) {
    if (h === 18 && m > 30) break;
    horariosClinica.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const form = ref({
  pacienteId: '',
  puestoId: '',
  sede: 'NEUQUEN_CAPITAL',
});

const cantidadReprogramaciones = computed(
  () => turnos.value.filter((t) => t.estado === 'REPROGRAMACION_SOLICITADA').length
);

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

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function badgeEstado(estado: string) {
  if (estado === 'CONFIRMADO' || estado === 'ATENDIDO') return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  if (estado === 'REPROGRAMACION_SOLICITADA' || estado === 'PROPUESTO_CLINICA') return 'bg-amber-50 text-amber-700 border-amber-200/80';
  if (estado === 'CANCELADO') return 'bg-rose-50 text-rose-700 border-rose-200/80';
  return 'bg-sky-50 text-sky-700 border-sky-200/80';
}

async function cargarDatos() {
  const [resPac, resPue, resTur] = await Promise.all([
    http.get('/pacientes'),
    http.get('/puestos'),
    http.get('/turnos'),
  ]);
  pacientes.value = resPac.data.data;
  puestos.value = resPue.data.data;
  turnos.value = resTur.data.data;

  // Inicializar hora por defecto para reprogramaciones pendientes
  for (const t of turnos.value) {
    if (t.estado === 'REPROGRAMACION_SOLICITADA' && !nuevasHoras.value[t.id]) {
      nuevasHoras.value[t.id] = '08:30';
    }
  }
}

async function crearTurno() {
  if (!fechaSeleccionada.value || !horaSeleccionada.value) return;
  creando.value = true;
  msgOk.value = '';
  try {
    const fechaHoraIso = new Date(`${fechaSeleccionada.value}T${horaSeleccionada.value}`).toISOString();
    await http.post('/turnos/proponer', {
      ...form.value,
      fechaHora: fechaHoraIso,
    });
    form.value.pacienteId = '';
    fechaSeleccionada.value = '';
    horaSeleccionada.value = '08:30';
    msgOk.value = 'Turno propuesto correctamente.';
    await cargarDatos();
  } finally {
    creando.value = false;
  }
}

async function reasignar(id: string) {
  const fecha = nuevasFechas.value[id];
  const hora = nuevasHoras.value[id] || '08:30';
  if (!fecha) return;
  await http.patch(`/turnos/${id}/reprogramar-clinica`, {
    nuevaFechaHora: new Date(`${fecha}T${hora}`).toISOString(),
  });
  await cargarDatos();
}

onMounted(cargarDatos);
</script>
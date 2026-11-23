<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <!-- Columna Izquierda: Credencial Digital QR -->
    <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print-clean-card">
      <div class="no-print px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <QrCode class="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Credencial de Aptitud</h2>
            <p class="text-xs text-slate-500">Habilitación digital para portería</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="credencial" class="space-y-5">
          <!-- Tarjeta tipo Carnet Corporativo -->
          <div class="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-sky-400 shrink-0" />
                <span class="text-xs font-bold tracking-wide uppercase text-slate-300">CheckPoint Salud</span>
              </div>
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide',
                  credencial.vigente
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', credencial.vigente ? 'bg-emerald-400' : 'bg-rose-400']"></span>
                {{ credencial.vigente ? 'APTO VIGENTE' : 'NO VIGENTE / VENCIDO' }}
              </span>
            </div>

            <!-- QR Centrado sobre fondo blanco puro para lectura óptica -->
            <div class="bg-white rounded-xl p-3 flex flex-col items-center justify-center mx-auto w-fit shadow-inner">
              <img :src="credencial.qrCodeDataUrl" alt="QR Credencial" class="w-44 h-44 object-contain" />
            </div>

            <div class="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div>
                <p class="text-slate-400 text-[11px]">Operario Habilitado</p>
                <p class="font-semibold text-sm text-white">{{ credencial.operario }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p class="text-slate-400 text-[11px]">DNI</p>
                  <p class="font-mono font-medium text-slate-200">{{ credencial.dni }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-[11px]">Vencimiento</p>
                  <p class="font-semibold text-slate-200">{{ formatearFecha(credencial.fechaVencimiento) }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-slate-400 text-[11px]">Empresa · Puesto</p>
                  <p class="font-medium text-slate-200 truncate">{{ credencial.empresa }} · {{ credencial.puesto }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones de la Credencial (ocultas al imprimir) -->
          <div class="no-print space-y-2.5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                :href="credencial.qrCodeDataUrl"
                :download="`Credencial_CheckPoint_${credencial.dni}.png`"
                class="btn-interactive group py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Download class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
                <span>Descargar QR</span>
              </a>
              <button
                type="button"
                @click="imprimirCredencial"
                class="btn-secondary group py-2.5 px-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer class="w-3.5 h-3.5 text-sky-600 transition-transform duration-200 group-hover:scale-110" />
                <span>Imprimir / PDF</span>
              </button>
            </div>

            <router-link
              :to="`/verificar/${credencial.dni}`"
              target="_blank"
              class="btn-secondary group w-full py-2 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <ExternalLink class="w-3.5 h-3.5 text-sky-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Abrir Vista Pública de Portería</span>
            </router-link>
          </div>
        </div>

        <!-- Estado sin certificado: ícono suelto limpio sin círculo amarillo de fondo -->
        <div v-else-if="sinCertificado" class="p-6 rounded-xl bg-slate-50/70 border border-dashed border-slate-300 text-center space-y-2.5">
          <Clock class="w-7 h-7 text-amber-500 mx-auto" />
          <h3 class="text-sm font-semibold text-slate-900">Certificado en trámite</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Tu credencial QR aparecerá aquí automáticamente una vez que el médico complete tu examen preocupacional o periódico.
          </p>
        </div>

        <div v-else class="py-10 text-center text-xs text-slate-400">
          Cargando credencial digital...
        </div>
      </div>
    </div>

    <!-- Columna Derecha: Agenda de Turnos Médicos (oculta al imprimir credencial) -->
    <div class="no-print lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <CalendarClock class="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Mis Turnos Médicos</h2>
            <p class="text-xs text-slate-500">Confirmación de asistencia y solicitudes de reprogramación</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {{ turnos.length }} {{ turnos.length === 1 ? 'turno' : 'turnos' }}
        </span>
      </div>

      <div class="p-6 space-y-4">
        <div v-if="turnos.length === 0" class="p-8 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-500">
          No tenés turnos médicos asignados actualmente.
        </div>

        <div
          v-for="t in turnos"
          :key="t.id"
          class="card-interactive p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white space-y-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-sky-600">Examen Ocupacional</span>
              <h3 class="text-base font-semibold text-slate-900 mt-0.5">{{ t.puesto.nombrePuesto }}</h3>
            </div>
            <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold border', badgeEstadoTurno(t.estado)]">
              {{ t.estado }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 text-xs">
            <div class="flex items-center gap-2 text-slate-600">
              <Calendar class="w-4 h-4 text-sky-600 shrink-0" />
              <span>{{ formatearFechaHora(t.fechaHora) }}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-600">
              <MapPin class="w-4 h-4 text-sky-600 shrink-0" />
              <span>{{ formatearSede(t.sede) }}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-600">
              <Building2 class="w-4 h-4 text-sky-600 shrink-0" />
              <span>Empresa: <strong class="text-slate-800">{{ t.aprobadoPorEmpresa ? 'Aprobado' : 'Pendiente' }}</strong></span>
            </div>
          </div>

          <div v-if="t.estado !== 'ATENDIDO' && t.estado !== 'CANCELADO'" class="pt-2 flex items-center gap-2.5 flex-wrap">
            <button
              v-if="!t.confirmadoPorPaciente"
              @click="confirmarAsistencia(t.id)"
              class="btn-interactive group px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 class="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
              <span>Confirmar Asistencia</span>
            </button>
            <span
              v-else
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
              Asistencia Confirmada
            </span>

            <button
              @click="abrirReprogramacion(t.id)"
              class="btn-secondary group px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw class="w-3.5 h-3.5 text-amber-600 transition-transform duration-300 group-hover:rotate-90" />
              <span>Solicitar Cambio de Fecha</span>
            </button>
          </div>

          <!-- Caja desplegable de reprogramación -->
          <div v-if="turnoReprogramando === t.id" class="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row gap-2">
            <input
              v-model="motivoReprog"
              type="text"
              placeholder="Ej: Estoy en diagrama en yacimiento..."
              class="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              @click="enviarReprogramacion(t.id)"
              class="btn-interactive px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shrink-0"
            >
              Enviar Solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  QrCode,
  ShieldCheck,
  Download,
  Printer,
  ExternalLink,
  Clock,
  CalendarClock,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-vue-next';
import http from '../api/http';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();
const turnos = ref<any[]>([]);
const credencial = ref<any>(null);
const sinCertificado = ref(false);
const turnoReprogramando = ref<string | null>(null);
const motivoReprog = ref('');

async function cargarDatos() {
  const { data: resTurnos } = await http.get('/turnos');
  turnos.value = resTurnos.data;

  if (auth.usuario?.dni) {
    try {
      const { data: resQr } = await http.get(`/credencial/${auth.usuario.dni}`);
      credencial.value = resQr.data;
      sinCertificado.value = false;
    } catch {
      sinCertificado.value = true;
    }
  }
}

function imprimirCredencial() {
  window.print();
}

async function confirmarAsistencia(id: string) {
  await http.patch(`/turnos/${id}/confirmar-paciente`);
  await cargarDatos();
}

function abrirReprogramacion(id: string) {
  turnoReprogramando.value = turnoReprogramando.value === id ? null : id;
  motivoReprog.value = '';
}

async function enviarReprogramacion(id: string) {
  if (!motivoReprog.value.trim()) return;
  await http.patch(`/turnos/${id}/solicitar-reprogramacion`, { motivo: motivoReprog.value });
  turnoReprogramando.value = null;
  await cargarDatos();
}

function badgeEstadoTurno(estado: string) {
  if (estado === 'CONFIRMADO' || estado === 'ATENDIDO') return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  if (estado === 'REPROGRAMACION_SOLICITADA') return 'bg-amber-50 text-amber-700 border-amber-200/80';
  if (estado === 'CANCELADO') return 'bg-rose-50 text-rose-700 border-rose-200/80';
  return 'bg-sky-50 text-sky-700 border-sky-200/80';
}

const formatearSede = (sede: string) => {
  const etiquetas: Record<string, string> = {
    NEUQUEN_CAPITAL: 'Neuquén Capital',
    RINCON_DE_LOS_SAUCES: 'Rincón de los Sauces',
  };
  return etiquetas[sede] || sede;
};

const formatearFecha = (iso: string) => new Date(iso).toLocaleDateString('es-AR');
const formatearFechaHora = (iso: string) => new Date(iso).toLocaleString('es-AR');

onMounted(cargarDatos);
</script>
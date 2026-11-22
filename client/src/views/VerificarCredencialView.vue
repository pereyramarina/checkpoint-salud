<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-900/30 via-slate-950 to-slate-950 pointer-events-none"></div>

    <!-- Barra Superior -->
    <header class="relative z-10 max-w-lg w-full mx-auto flex items-center justify-between py-2">
      <div class="flex items-center gap-2.5 text-white">
        <div class="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <div>
          <span class="font-bold text-sm tracking-tight block leading-none">CheckPoint Salud</span>
          <span class="text-[11px] text-slate-400">Control de Portería</span>
        </div>
      </div>

      <router-link
        to="/login"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
      >
        <LogIn class="w-3.5 h-3.5 text-sky-400" />
        <span>Acceso Sistema</span>
      </router-link>
    </header>

    <!-- Tarjeta Principal de Verificación -->
    <main class="relative z-10 max-w-lg w-full mx-auto my-auto py-6">
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden">
        <div class="p-6 sm:p-8 space-y-6">
          <div class="text-center space-y-1.5">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/70 text-sky-700 text-[11px] font-bold uppercase tracking-wider">
              <QrCode class="w-3.5 h-3.5" />
              Validación Pública
            </span>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pt-1">
              Verificación de Aptitud Laboral
            </h1>
            <p class="text-xs sm:text-sm text-slate-500">
              Ingresá el número de DNI o escaneá la credencial del operario.
            </p>
          </div>

          <!-- Buscador de DNI -->
          <form @submit.prevent="consultarDni" class="flex flex-col sm:flex-row gap-2.5">
            <div class="relative flex-1">
              <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="dniInput"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="DNI sin puntos (Ej: 36987654)"
                required
                autocomplete="off"
                class="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <button
              type="submit"
              :disabled="cargando"
              class="py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{{ cargando ? 'Verificando...' : 'Verificar' }}</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </form>

          <!-- Error / No encontrado -->
          <div
            v-if="errorMsg"
            class="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-800 space-y-1.5"
          >
            <div class="flex items-center gap-2 font-bold text-sm text-rose-700">
              <ShieldX class="w-5 h-5 shrink-0 text-rose-600" />
              <span>Acceso Denegado</span>
            </div>
            <p class="text-xs leading-relaxed text-rose-700 pl-7">{{ errorMsg }}</p>
          </div>

          <!-- Resultado de Verificación -->
          <div v-if="datos" class="space-y-5 pt-1">
            <!-- Banner de Alto Contraste -->
            <div
              :class="[
                'p-4 rounded-2xl border flex items-center gap-3.5',
                datos.vigente
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              ]"
            >
              <div
                :class="[
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                  datos.vigente ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                ]"
              >
                <ShieldCheck v-if="datos.vigente" class="w-6 h-6" />
                <ShieldAlert v-else class="w-6 h-6" />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  {{ datos.vigente ? 'Credencial Válida' : 'Restricción de Ingreso' }}
                </p>
                <p class="text-sm sm:text-base font-extrabold leading-tight mt-0.5">
                  {{ datos.vigente ? 'HABILITADO PARA INGRESO' : 'NO HABILITADO / VENCIDO' }}
                </p>
              </div>
            </div>

            <!-- Tabla de Datos del Operario -->
            <div class="rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden text-xs sm:text-sm">
              <div class="px-4 py-3 bg-slate-50/70 flex items-center justify-between gap-4">
                <span class="text-slate-500">Operario</span>
                <strong class="text-slate-900 text-right">{{ datos.operario }}</strong>
              </div>
              <div class="px-4 py-3 flex items-center justify-between gap-4">
                <span class="text-slate-500">DNI</span>
                <strong class="font-mono text-slate-900">{{ datos.dni }}</strong>
              </div>
              <div class="px-4 py-3 bg-slate-50/70 flex items-center justify-between gap-4">
                <span class="text-slate-500">Empresa</span>
                <strong class="text-slate-900 text-right">{{ datos.empresa }}</strong>
              </div>
              <div class="px-4 py-3 flex items-center justify-between gap-4">
                <span class="text-slate-500">Puesto</span>
                <strong class="text-slate-900 text-right">{{ datos.puesto }}</strong>
              </div>
              <div class="px-4 py-3 bg-slate-50/70 flex items-center justify-between gap-4">
                <span class="text-slate-500">Dictamen</span>
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                    datos.vigente
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  ]"
                >
                  {{ datos.resultado }}
                </span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between gap-4">
                <span class="text-slate-500">Vencimiento</span>
                <strong class="text-slate-900">{{ formatearFecha(datos.fechaVencimiento) }}</strong>
              </div>
            </div>

            <!-- Nota Legal Ley 25.326 -->
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-[11px] text-slate-500">
              <Lock class="w-4 h-4 text-sky-600 shrink-0" />
              <span>Validación pública sin exposición de historia clínica conforme a la Ley N° 25.326.</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 text-center text-xs text-slate-500 py-2">
      © 2026 CheckPoint Salud · Sedes Neuquén Capital & Rincón de los Sauces
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  QrCode,
  Search,
  ArrowRight,
  LogIn,
  Lock,
} from 'lucide-vue-next';
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
    const res = await axios.get(`/api/public/verificar/${dniInput.value.trim()}`);
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
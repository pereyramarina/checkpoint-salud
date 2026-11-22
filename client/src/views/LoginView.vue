<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-white">
    <!-- Panel Izquierdo: Texto Fijo + Fondo Parallax Animado -->
    <div
      ref="panelIzquierdo"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      class="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-12 relative overflow-hidden"
    >
      <!-- Capa 1 (Fondo profundo): Orbes de luz con animación flotante + parallax amplio -->
      <div
        :style="estiloCapaFondo"
        class="absolute -inset-24 transition-transform duration-300 ease-out pointer-events-none"
      >
        <div class="w-full h-full relative">
          <div class="orb-sky absolute top-10 right-10 w-[420px] h-[420px] rounded-full bg-sky-500/20 blur-3xl"></div>
          <div class="orb-emerald absolute bottom-10 left-6 w-[360px] h-[360px] rounded-full bg-emerald-500/10 blur-3xl"></div>
        </div>
      </div>

      <!-- Capa 2 (Plano medio): Grilla técnica con desplazamiento continuo + parallax medio -->
      <div
        :style="estiloCapaMedia"
        class="absolute -inset-20 transition-transform duration-300 ease-out pointer-events-none [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_45%,transparent_100%)]"
      >
        <div class="grid-animada w-full h-full opacity-45"></div>
      </div>

      <!-- Header (Fijo) -->
      <div class="relative z-10 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 backdrop-blur-xs">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <div>
          <span class="font-bold text-lg tracking-tight block leading-none">CheckPoint Salud</span>
          <span class="text-xs text-slate-400">Medicina Ocupacional</span>
        </div>
      </div>

      <!-- Contenido Principal (Completamente quieto para máxima legibilidad) -->
      <div class="relative z-10 max-w-md space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium backdrop-blur-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Sedes Neuquén Capital · Rincón de los Sauces
        </div>

        <h2 class="text-3xl font-bold tracking-tight text-slate-50 leading-tight">
          Control automático de vigencias y aptitud médica en yacimiento.
        </h2>

        <p class="text-slate-400 text-sm leading-relaxed">
          Autogestión de nóminas corporativas, emisión de credenciales digitales con QR offline y trazabilidad legal en tiempo real.
        </p>

        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div class="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xs">
            <p class="text-xs text-slate-400">Privacidad Clínica</p>
            <p class="text-sm font-semibold text-slate-200 mt-0.5">Ley N° 25.326</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xs">
            <p class="text-xs text-slate-400">Control en Portería</p>
            <p class="text-sm font-semibold text-slate-200 mt-0.5">Validación QR Instantánea</p>
          </div>
        </div>
      </div>

      <!-- Footer (Fijo) -->
      <div class="relative z-10 flex items-center justify-between text-xs text-slate-500">
        <span>© 2026 CheckPoint Salud · Cuenca Neuquina</span>
        <router-link to="/verificar" class="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1">
          Acceso Portería <ArrowUpRight class="w-3.5 h-3.5" />
        </router-link>
      </div>
    </div>

    <!-- Panel Derecho: Formulario de Ingreso -->
    <div class="flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-50/50">
      <div class="w-full max-w-md space-y-8">
        <!-- Header móvil -->
        <div class="lg:hidden flex items-center gap-3 justify-center">
          <div class="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div class="text-left">
            <h1 class="font-bold text-xl text-slate-900 leading-none">CheckPoint Salud</h1>
            <p class="text-xs text-slate-500 mt-0.5">Medicina Ocupacional · Cuenca Neuquina</p>
          </div>
        </div>

        <div class="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div class="space-y-1.5">
            <h2 class="text-xl font-semibold tracking-tight text-slate-900">Iniciar sesión</h2>
            <p class="text-sm text-slate-500">Seleccioná tu perfil para acceder al sistema.</p>
          </div>

          <div class="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              type="button"
              @click="cambiarModo('OPERARIO')"
              :class="[
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                modo === 'OPERARIO'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              <HardHat class="w-4 h-4 text-sky-600" /> Operario (DNI)
            </button>
            <button
              type="button"
              @click="cambiarModo('CORPORATIVO')"
              :class="[
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                modo === 'CORPORATIVO'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              <Building2 class="w-4 h-4 text-sky-600" /> Clínica / Empresa
            </button>
          </div>

          <form v-if="modo === 'OPERARIO'" @submit.prevent="ingresarOperario" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Número de DNI (sin puntos)</label>
              <input
                v-model="dni"
                type="text"
                inputmode="numeric"
                placeholder="Ej: 36987654"
                required
                autocomplete="off"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
            <button
              type="submit"
              :disabled="cargando"
              class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{{ cargando ? 'Verificando padrón...' : 'Ingresar a mis Turnos y QR' }}</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </form>

          <form v-else @submit.prevent="ingresarCorporativo" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Correo Electrónico</label>
              <input
                v-model="email"
                type="email"
                placeholder="usuario@checkpointsalud.com"
                required
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Contraseña</label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
            <button
              type="submit"
              :disabled="cargando"
              class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{{ cargando ? 'Autenticando...' : 'Iniciar Sesión' }}</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </form>

          <div v-if="error" class="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
            <span>{{ error }}</span>
          </div>
        </div>

        <div class="text-center">
          <router-link to="/verificar" class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <QrCode class="w-4 h-4 text-sky-600" /> ¿Sos guardia de portería? Verificar credencial sin iniciar sesión
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck, HardHat, Building2, ArrowRight, ArrowUpRight, AlertCircle, QrCode } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();
const router = useRouter();
const modo = ref<'OPERARIO' | 'CORPORATIVO'>('OPERARIO');
const dni = ref('');
const email = ref('');
const password = ref('');
const cargando = ref(false);
const error = ref('');

// Parallax solo en capas de fondo
const panelIzquierdo = ref<HTMLElement | null>(null);
const offsetX = ref(0);
const offsetY = ref(0);

function onMouseMove(e: MouseEvent) {
  if (!panelIzquierdo.value) return;
  const rect = panelIzquierdo.value.getBoundingClientRect();
  offsetX.value = (e.clientX - rect.left) / rect.width - 0.5;
  offsetY.value = (e.clientY - rect.top) / rect.height - 0.5;
}

function onMouseLeave() {
  offsetX.value = 0;
  offsetY.value = 0;
}

const estiloCapaFondo = computed(() => ({
  transform: `translate3d(${offsetX.value * 55}px, ${offsetY.value * 55}px, 0)`,
}));

const estiloCapaMedia = computed(() => ({
  transform: `translate3d(${offsetX.value * 25}px, ${offsetY.value * 25}px, 0)`,
}));

function cambiarModo(nuevoModo: 'OPERARIO' | 'CORPORATIVO') {
  modo.value = nuevoModo;
  error.value = '';
}

async function ingresarOperario() {
  cargando.value = true;
  error.value = '';
  try {
    await auth.loginOperarioDNI(dni.value.trim());
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'DNI no registrado en el padrón.';
  } finally {
    cargando.value = false;
  }
}

async function ingresarCorporativo() {
  cargando.value = true;
  error.value = '';
  try {
    await auth.loginCorporativo(email.value.trim(), password.value);
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Credenciales inválidas.';
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.grid-animada {
  background-image:
    linear-gradient(to right, rgba(56, 189, 248, 0.14) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(56, 189, 248, 0.14) 1px, transparent 1px);
  background-size: 64px 64px;
  animation: desplazarGrilla 18s linear infinite;
}

.orb-sky {
  animation: flotarSuave 12s ease-in-out infinite alternate;
}

.orb-emerald {
  animation: flotarSuave 15s ease-in-out infinite alternate-reverse;
}

@keyframes desplazarGrilla {
  0% {
    background-position: 0px 0px;
  }
  100% {
    background-position: 64px 64px;
  }
}

@keyframes flotarSuave {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  100% {
    transform: translate(-30px, 25px) scale(1.08);
  }
}
</style>
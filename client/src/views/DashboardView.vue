<template>
  <div class="min-h-screen flex bg-slate-50/80 text-slate-900">
    <!-- Sidebar Lateral (Desktop - oculto al imprimir) -->
    <aside class="no-print hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200/80 z-30">
      <!-- Marca limpia sin cajita ni sombra alrededor del ícono -->
      <div class="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200/80 group">
        <ShieldCheck class="w-7 h-7 text-sky-600 shrink-0 transition-transform duration-300 group-hover:scale-105" />
        <div class="min-w-0">
          <span class="font-bold text-sm tracking-tight text-slate-900 block truncate">
            CheckPoint <span class="text-sky-600">Salud</span>
          </span>
          <span class="text-[11px] text-slate-500 block truncate">Medicina Ocupacional</span>
        </div>
      </div>

      <!-- Navegación del Rol -->
      <div class="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        <div>
          <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Espacio de Trabajo</p>
          <nav class="space-y-1">
            <a href="#" @click.prevent class="group flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100/90 text-slate-900 font-medium text-sm transition-all">
              <component :is="rolConfig.icono" class="w-4 h-4 text-sky-600 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span class="truncate">{{ rolConfig.titulo }}</span>
            </a>
            <router-link
              to="/verificar"
              target="_blank"
              class="group flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm transition-all"
            >
              <span class="flex items-center gap-3 truncate">
                <QrCode class="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-all duration-200 group-hover:scale-110 shrink-0" />
                <span>Portería / Verificar</span>
              </span>
              <ExternalLink class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </router-link>
          </nav>
        </div>

        <!-- Contexto Operativo -->
        <div class="px-3">
          <div class="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200/70 space-y-2 transition-colors hover:border-sky-200/80">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <MapPin class="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Contexto Activo</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              <template v-if="auth.usuario?.empresa?.razonSocial">
                Empresa: <strong class="text-slate-900">{{ auth.usuario.empresa.razonSocial }}</strong>
              </template>
              <template v-else-if="auth.usuario?.sede">
                Sede: <strong class="text-slate-900">{{ formatearSede(auth.usuario.sede) }}</strong>
              </template>
              <template v-else>
                Operación Global · <strong class="text-slate-900">Cuenca Neuquina</strong>
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- Perfil y Cierre de Sesión -->
      <div class="p-3 border-t border-slate-200/80">
        <div class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50/80 transition-colors">
          <div class="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
            {{ inicialesUsuario }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-900 truncate">{{ auth.usuario?.nombre }}</p>
            <p class="text-[11px] text-slate-500 truncate">{{ rolConfig.etiquetaRol }}</p>
          </div>
          <button
            @click="salir"
            title="Cerrar sesión"
            class="group p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Contenedor Principal -->
    <div class="flex-1 md:pl-64 print:pl-0 flex flex-col min-w-0">
      <!-- Topbar (oculto al imprimir) -->
      <header class="no-print h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm min-w-0">
          <!-- Marca en móvil -->
          <div class="md:hidden flex items-center gap-2 mr-1">
            <ShieldCheck class="w-5 h-5 text-sky-600 shrink-0" />
            <span class="font-bold text-sm text-slate-900">CheckPoint</span>
          </div>
          <span class="text-slate-400 hidden md:inline">CheckPoint</span>
          <ChevronRight class="w-4 h-4 text-slate-300 hidden md:inline shrink-0" />
          <h1 class="font-semibold text-slate-900 truncate hidden sm:block">{{ rolConfig.titulo }}</h1>
        </div>

        <div class="flex items-center gap-2.5">
          <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema Operativo
          </span>

          <button
            @click="salir"
            class="md:hidden btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/70 cursor-pointer"
          >
            <LogOut class="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </header>

      <!-- Membrete visible únicamente al imprimir / guardar PDF -->
      <div class="print-only px-2 pb-4 mb-4 border-b border-slate-300 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <ShieldCheck class="w-7 h-7 text-sky-600 shrink-0" />
          <div>
            <span class="font-bold text-base text-slate-900 block leading-none">CheckPoint Salud</span>
            <span class="text-[11px] text-slate-500">Medicina Ocupacional · Cuenca Neuquina</span>
          </div>
        </div>
        <div class="text-right text-xs text-slate-600">
          <p class="font-semibold text-slate-900">{{ rolConfig.titulo }}</p>
          <p>Emitido: {{ new Date().toLocaleDateString('es-AR') }}</p>
        </div>
      </div>

      <!-- Área de Contenido Dinámico -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 print:p-0 animate-enter">
        <PanelOperario v-if="auth.rolActual === 'PACIENTE'" />
        <PanelEmpresa v-else-if="auth.rolActual === 'EMPRESA'" />
        <PanelRecepcion v-else-if="auth.rolActual === 'RECEPCION'" />
        <PanelMedico v-else-if="auth.rolActual === 'MEDICO'" />
        <PanelSuperAdmin v-else-if="auth.rolActual === 'SUPERADMIN'" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck, QrCode, ExternalLink, MapPin, LogOut, ChevronRight, Stethoscope, CalendarClock, Building2, HardHat, Settings2 } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';
import PanelOperario from '../components/PanelOperario.vue';
import PanelEmpresa from '../components/PanelEmpresa.vue';
import PanelRecepcion from '../components/PanelRecepcion.vue';
import PanelMedico from '../components/PanelMedico.vue';
import PanelSuperAdmin from '../components/PanelSuperAdmin.vue';

const auth = useAuthStore();
const router = useRouter();

const rolConfig = computed(() => {
  switch (auth.rolActual) {
    case 'MEDICO': return { titulo: 'Consultorio Médico', etiquetaRol: 'Médico Laboral', icono: Stethoscope };
    case 'RECEPCION': return { titulo: 'Agenda y Recepción', etiquetaRol: 'Admisión Clínica', icono: CalendarClock };
    case 'EMPRESA': return { titulo: 'Portal Corporativo RRHH', etiquetaRol: 'Empresa Contratista', icono: Building2 };
    case 'PACIENTE': return { titulo: 'Mi Credencial y Turnos', etiquetaRol: 'Operario', icono: HardHat };
    default: return { titulo: 'Administración General', etiquetaRol: 'SuperAdmin', icono: Settings2 };
  }
});

const inicialesUsuario = computed(() => (auth.usuario?.nombre || 'US').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase());

function formatearSede(sede: string) {
  return ({ NEUQUEN_CAPITAL: 'Neuquén Capital', RINCON_DE_LOS_SAUCES: 'Rincón de los Sauces' } as Record<string, string>)[sede] || sede;
}

function salir() {
  auth.cerrarSesion();
  router.push('/login');
}
</script>
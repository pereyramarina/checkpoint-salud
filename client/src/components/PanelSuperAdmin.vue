<template>
  <div class="space-y-8">
    <!-- Métricas Rápidas (KPIs con íconos sueltos sin cajita de fondo) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Empresas Contratistas</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ empresas.length }}</p>
        </div>
        <Building2 class="w-6 h-6 text-sky-600 shrink-0" />
      </div>

      <div class="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Sedes Activas</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">2</p>
        </div>
        <MapPin class="w-6 h-6 text-emerald-600 shrink-0" />
      </div>

      <div class="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Roles Habilitados</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">4</p>
        </div>
        <UserCog class="w-6 h-6 text-indigo-600 shrink-0" />
      </div>
    </div>

    <!-- Formularios de Alta (ocultos al imprimir padrón de empresas) -->
    <div class="no-print grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Alta Empresa -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <Building2 class="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Registrar Nueva Empresa Cliente</h2>
            <p class="text-xs text-slate-500">Habilitación de contratistas para autogestión de nómina.</p>
          </div>
        </div>

        <form @submit.prevent="crearEmpresa" class="p-6 space-y-4 flex-1 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Razón Social</label>
              <input
                v-model="empForm.razonSocial"
                placeholder="Ej: Servicios Petroleros Neuquén S.A."
                required
                class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-700">CUIT</label>
                <input
                  v-model="empForm.cuit"
                  placeholder="30-71234567-9"
                  required
                  class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-700">Email Alertas RRHH</label>
                <input
                  v-model="empForm.emailAlertas"
                  type="email"
                  placeholder="rrhh@empresa.com"
                  required
                  class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div class="pt-2 space-y-3">
            <button
              type="submit"
              :disabled="cargandoEmp"
              class="btn-interactive group w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus class="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
              <span>{{ cargandoEmp ? 'Guardando...' : 'Guardar Empresa' }}</span>
            </button>

            <div v-if="msgEmp" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{{ msgEmp }}</span>
            </div>
            <div v-if="errEmp" class="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
              <span>{{ errEmp }}</span>
            </div>
          </div>
        </form>
      </div>

      <!-- Alta Usuario -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <UserPlus class="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Crear Cuenta de Usuario</h2>
            <p class="text-xs text-slate-500">Asignación de credenciales para personal clínico o RRHH.</p>
          </div>
        </div>

        <form @submit.prevent="crearUsuario" class="p-6 space-y-4 flex-1 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-700">Nombre Completo</label>
                <input
                  v-model="usrForm.nombre"
                  placeholder="Dr. Carlos Méndez"
                  required
                  class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-700">Email de Acceso</label>
                <input
                  v-model="usrForm.email"
                  type="email"
                  placeholder="usuario@checkpointsalud.com"
                  required
                  class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-700">Contraseña Temporal</label>
                <input
                  v-model="usrForm.password"
                  type="password"
                  placeholder="••••••••"
                  required
                  class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-700">Rol del Sistema</label>
                <select
                  v-model="usrForm.rol"
                  required
                  class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                >
                  <option value="MEDICO">Médico Laboral (MEDICO)</option>
                  <option value="RECEPCION">Recepción / Admisión (RECEPCION)</option>
                  <option value="EMPRESA">Empresa Contratista (EMPRESA)</option>
                  <option value="SUPERADMIN">Administrador General (SUPERADMIN)</option>
                </select>
              </div>
            </div>

            <div v-if="usrForm.rol === 'MEDICO' || usrForm.rol === 'RECEPCION'" class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Sede Asignada</label>
              <select
                v-model="usrForm.sede"
                class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option value="NEUQUEN_CAPITAL">Neuquén Capital</option>
                <option value="RINCON_DE_LOS_SAUCES">Rincón de los Sauces</option>
              </select>
            </div>

            <div v-if="usrForm.rol === 'EMPRESA'" class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-700">Empresa Vinculada</label>
              <select
                v-model="usrForm.empresaId"
                required
                class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option value="" disabled>Seleccione empresa...</option>
                <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.razonSocial }}</option>
              </select>
            </div>
          </div>

          <div class="pt-2 space-y-3">
            <button
              type="submit"
              :disabled="cargandoUsr"
              class="btn-interactive group w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus class="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>{{ cargandoUsr ? 'Creando cuenta...' : 'Crear Usuario' }}</span>
            </button>

            <div v-if="msgUsr" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{{ msgUsr }}</span>
            </div>
            <div v-if="errUsr" class="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
              <span>{{ errUsr }}</span>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de Empresas Registradas -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print-clean-card">
      <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">Empresas Clientes Registradas</h3>
          <p class="text-xs text-slate-500">Padrón de contratistas habilitadas en la plataforma.</p>
        </div>

        <div class="no-print flex items-center gap-2 flex-wrap">
          <button
            v-if="empresas.length > 0"
            type="button"
            @click="exportarEmpresasExcel"
            class="btn-secondary group px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
            <span>Exportar Excel</span>
          </button>

          <button
            v-if="empresas.length > 0"
            type="button"
            @click="imprimirEmpresas"
            class="btn-secondary group px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer class="w-3.5 h-3.5 text-sky-600 transition-transform duration-200 group-hover:scale-110" />
            <span>Imprimir / PDF</span>
          </button>

          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {{ empresas.length }} {{ empresas.length === 1 ? 'empresa' : 'empresas' }}
          </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-6">Razón Social</th>
              <th class="py-3 px-6">CUIT</th>
              <th class="py-3 px-6">Email Alertas RRHH</th>
              <th class="py-3 px-6 text-right">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-if="empresas.length === 0">
              <td colspan="4" class="py-8 px-6 text-center text-xs text-slate-400">
                No hay empresas registradas todavía.
              </td>
            </tr>
            <tr v-for="emp in empresas" :key="emp.id" class="hover:bg-slate-50/70 transition-colors">
              <td class="py-3.5 px-6 font-medium text-slate-900">{{ emp.razonSocial }}</td>
              <td class="py-3.5 px-6 text-slate-600 font-mono text-xs">{{ emp.cuit }}</td>
              <td class="py-3.5 px-6 text-slate-600">{{ emp.emailAlertas }}</td>
              <td class="py-3.5 px-6 text-right">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Activa
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import {
  Building2,
  MapPin,
  UserCog,
  UserPlus,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
} from 'lucide-vue-next';
import http from '../api/http';

const empresas = ref<any[]>([]);
const msgEmp = ref('');
const errEmp = ref('');
const msgUsr = ref('');
const errUsr = ref('');
const cargandoEmp = ref(false);
const cargandoUsr = ref(false);

const empForm = ref({ razonSocial: '', cuit: '', emailAlertas: '' });
const usrForm = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'MEDICO',
  sede: 'NEUQUEN_CAPITAL',
  empresaId: '',
});

async function cargarEmpresas() {
  const { data } = await http.get('/admin/empresas');
  empresas.value = data.data;
}

async function crearEmpresa() {
  msgEmp.value = '';
  errEmp.value = '';
  cargandoEmp.value = true;
  try {
    await http.post('/admin/empresas', empForm.value);
    empForm.value = { razonSocial: '', cuit: '', emailAlertas: '' };
    msgEmp.value = 'Empresa registrada correctamente.';
    await cargarEmpresas();
  } catch (err: any) {
    errEmp.value = err.response?.data?.error || 'Error al registrar la empresa.';
  } finally {
    cargandoEmp.value = false;
  }
}

async function crearUsuario() {
  msgUsr.value = '';
  errUsr.value = '';
  cargandoUsr.value = true;
  try {
    const payload: Record<string, any> = {
      nombre: usrForm.value.nombre.trim(),
      email: usrForm.value.email.trim(),
      passwordPlain: usrForm.value.password,
      rol: usrForm.value.rol,
    };

    if (usrForm.value.rol === 'MEDICO' || usrForm.value.rol === 'RECEPCION') {
      payload.sede = usrForm.value.sede;
    }

    if (usrForm.value.rol === 'EMPRESA' && usrForm.value.empresaId) {
      payload.empresaId = usrForm.value.empresaId;
    }

    await http.post('/admin/usuarios', payload);
    usrForm.value.nombre = '';
    usrForm.value.email = '';
    usrForm.value.password = '';
    usrForm.value.empresaId = '';
    msgUsr.value = 'Usuario creado correctamente.';
  } catch (err: any) {
    errUsr.value = err.response?.data?.error || 'Error al crear el usuario.';
  } finally {
    cargandoUsr.value = false;
  }
}

function exportarEmpresasExcel() {
  const filas = empresas.value.map((emp) => ({
    'Razón Social': emp.razonSocial,
    CUIT: emp.cuit,
    'Email Alertas RRHH': emp.emailAlertas,
    Estado: 'Activa',
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);
  hoja['!cols'] = [{ wch: 32 }, { wch: 18 }, { wch: 30 }, { wch: 14 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Empresas_Clientes');
  XLSX.writeFile(libro, `Empresas_Clientes_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function imprimirEmpresas() {
  window.print();
}

onMounted(cargarEmpresas);
</script>
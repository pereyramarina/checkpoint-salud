<template>
  <div class="grid-2">
    <!-- Alta Empresa -->
    <div class="card">
      <h2>Registrar Nueva Empresa Cliente</h2>
      <form @submit.prevent="crearEmpresa" class="form">
        <label>Razón Social</label>
        <input v-model="empForm.razonSocial" placeholder="Ej: Servicios Petroleros Neuquén S.A." required />
        <label>CUIT</label>
        <input v-model="empForm.cuit" placeholder="30-71234567-9" required />
        <label>Email Alertas RRHH</label>
        <input v-model="empForm.emailAlertas" type="email" placeholder="rrhh@empresa.com" required />
        <button type="submit" class="btn btn-primary">Guardar Empresa</button>
      </form>
      <p v-if="msgEmp" class="ok">{{ msgEmp }}</p>
      <p v-if="errEmp" class="err">{{ errEmp }}</p>
    </div>

    <!-- Alta Usuario -->
    <div class="card">
      <h2>Crear Cuenta de Usuario</h2>
      <form @submit.prevent="crearUsuario" class="form">
        <label>Nombre Completo</label>
        <input v-model="usrForm.nombre" placeholder="Dr. Carlos Méndez" required />
        <label>Email de Acceso</label>
        <input v-model="usrForm.email" type="email" placeholder="usuario@checkpointsalud.com" required />
        <label>Contraseña Temporal</label>
        <input v-model="usrForm.password" type="password" required />
        <label>Rol</label>
        <select v-model="usrForm.rol" required>
          <option value="MEDICO">MEDICO</option>
          <option value="RECEPCION">RECEPCION</option>
          <option value="EMPRESA">EMPRESA</option>
          <option value="SUPERADMIN">SUPERADMIN</option>
        </select>

        <template v-if="usrForm.rol === 'MEDICO' || usrForm.rol === 'RECEPCION'">
          <label>Sede Asignada</label>
          <select v-model="usrForm.sede">
            <option value="NEUQUEN_CAPITAL">Neuquén Capital</option>
            <option value="RINCON_DE_LOS_SAUCES">Rincón de los Sauces</option>
          </select>
        </template>

        <template v-if="usrForm.rol === 'EMPRESA'">
          <label>Empresa Vinculada</label>
          <select v-model="usrForm.empresaId" required>
            <option value="" disabled>Seleccione empresa...</option>
            <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.razonSocial }}</option>
          </select>
        </template>

        <button type="submit" class="btn btn-primary">Crear Usuario</button>
      </form>
      <p v-if="msgUsr" class="ok">{{ msgUsr }}</p>
      <p v-if="errUsr" class="err">{{ errUsr }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import http from '../api/http';

const empresas = ref<any[]>([]);
const msgEmp = ref('');
const errEmp = ref('');
const msgUsr = ref('');
const errUsr = ref('');

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
  try {
    await http.post('/admin/empresas', empForm.value);
    empForm.value = { razonSocial: '', cuit: '', emailAlertas: '' };
    msgEmp.value = 'Empresa registrada correctamente.';
    await cargarEmpresas();
  } catch (err: any) {
    errEmp.value = err.response?.data?.error || 'Error al registrar la empresa.';
  }
}

async function crearUsuario() {
  msgUsr.value = '';
  errUsr.value = '';
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
  }
}

onMounted(cargarEmpresas);
</script>

<style scoped>
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; }
.card { background: #fff; padding: 1.5rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
h2 { font-size: 1.15rem; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
.form { display: flex; flex-direction: column; gap: 0.65rem; }
label { font-size: 0.85rem; font-weight: 600; }
input, select { padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-primary { margin-top: 0.4rem; padding: 0.65rem; background: #1d4ed8; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.ok { margin-top: 0.6rem; color: #16a34a; font-weight: 600; font-size: 0.85rem; }
.err { margin-top: 0.6rem; color: #dc2626; font-weight: 600; font-size: 0.85rem; }
</style>
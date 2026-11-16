<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="brand">
        <h1>CheckPoint Salud</h1>
        <p>Medicina Ocupacional · Cuenca Neuquina</p>
      </div>

      <div class="tabs">
        <button
          :class="['tab', { active: modo === 'OPERARIO' }]"
          @click="cambiarModo('OPERARIO')"
        >
          Soy Operario (DNI)
        </button>
        <button
          :class="['tab', { active: modo === 'CORPORATIVO' }]"
          @click="cambiarModo('CORPORATIVO')"
        >
          Clínica / Empresa
        </button>
      </div>

      <form v-if="modo === 'OPERARIO'" @submit.prevent="ingresarOperario" class="form">
        <label>Número de DNI (sin puntos)</label>
        <input
          v-model="dni"
          type="text"
          placeholder="Ej: 36987654"
          required
          autocomplete="off"
        />
        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'Verificando...' : 'Ingresar a mis Turnos y QR' }}
        </button>
      </form>

      <form v-else @submit.prevent="ingresarCorporativo" class="form">
        <label>Correo Electrónico</label>
        <input
          v-model="email"
          type="email"
          placeholder="usuario@checkpointsalud.com"
          required
        />
        <label>Contraseña</label>
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
        />
        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'Autenticando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();
const router = useRouter();

const modo = ref<'OPERARIO' | 'CORPORATIVO'>('OPERARIO');
const dni = ref('');
const email = ref('');
const password = ref('');
const cargando = ref(false);
const error = ref('');

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
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  padding: 1rem;
}

.login-card {
  background: #ffffff;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
}

.brand {
  text-align: center;
  margin-bottom: 1.5rem;
}

.brand h1 {
  font-size: 1.6rem;
  color: #0f172a;
}

.brand p {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.tab {
  border: none;
  background: transparent;
  padding: 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #475569;
  cursor: pointer;
}

.tab.active {
  background: #ffffff;
  color: #1d4ed8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

input {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
}

input:focus {
  outline: none;
  border-color: #2563eb;
}

.btn-primary {
  margin-top: 0.5rem;
  padding: 0.8rem;
  background: #1d4ed8;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error-msg {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
}
</style>
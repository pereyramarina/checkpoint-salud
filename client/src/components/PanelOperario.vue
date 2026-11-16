<template>
  <div class="grid-2">
    <!-- Credencial QR -->
    <div class="card">
      <h2>Mi Credencial de Aptitud (QR)</h2>
      <div v-if="credencial" class="qr-box">
        <span :class="['badge', credencial.vigente ? 'badge-ok' : 'badge-err']">
          {{ credencial.vigente ? 'APTO VIGENTE' : 'NO VIGENTE / VENCIDO' }}
        </span>
        <img :src="credencial.qrCodeDataUrl" alt="QR Credencial" class="qr-img" />
        <p><strong>Operario:</strong> {{ credencial.operario }}</p>
        <p><strong>DNI:</strong> {{ credencial.dni }}</p>
        <p><strong>Empresa:</strong> {{ credencial.empresa }}</p>
        <p><strong>Puesto:</strong> {{ credencial.puesto }}</p>
        <p><strong>Resultado:</strong> {{ credencial.resultado }}</p>
        <p><strong>Vence:</strong> {{ formatearFecha(credencial.fechaVencimiento) }}</p>

        <div class="qr-actions">
          <a
            :href="credencial.qrCodeDataUrl"
            :download="`Credencial_CheckPoint_${credencial.dni}.png`"
            class="btn btn-primary"
          >
            Descargar QR (Offline)
          </a>
          <router-link
            :to="`/verificar/${credencial.dni}`"
            target="_blank"
            class="btn btn-outline"
          >
            Ver Vista Portería
          </router-link>
        </div>
      </div>

      <div v-else-if="sinCertificado" class="empty-state">
        <strong>Certificado en trámite</strong>
        <p>Tu credencial QR aparecerá aquí automáticamente una vez que el médico complete tu examen preocupacional o periódico.</p>
      </div>
      <p v-else class="muted">Cargando credencial...</p>
    </div>

    <!-- Turnos del Operario -->
    <div class="card">
      <h2>Mis Turnos Médicos</h2>
      <div v-if="turnos.length === 0" class="muted">No tienes turnos asignados actualmente.</div>
      <div v-for="t in turnos" :key="t.id" class="item-box">
        <div class="item-header">
          <strong>{{ t.puesto.nombrePuesto }}</strong>
          <span class="badge badge-info">{{ t.estado }}</span>
        </div>
        <p><strong>Fecha y Hora:</strong> {{ formatearFechaHora(t.fechaHora) }}</p>
        <p><strong>Sede:</strong> {{ formatearSede(t.sede) }}</p>
        <p><strong>Aprobado por Empresa:</strong> {{ t.aprobadoPorEmpresa ? 'Sí' : 'Pendiente' }}</p>

        <div v-if="t.estado !== 'ATENDIDO' && t.estado !== 'CANCELADO'" class="actions">
          <button
            v-if="!t.confirmadoPorPaciente"
            class="btn btn-success"
            @click="confirmarAsistencia(t.id)"
          >
            Confirmar Asistencia
          </button>
          <button class="btn btn-warning" @click="abrirReprogramacion(t.id)">
            Solicitar Cambio de Fecha
          </button>
        </div>

        <div v-if="turnoReprogramando === t.id" class="reprog-box">
          <input
            v-model="motivoReprog"
            type="text"
            placeholder="Ej: Estoy en diagrama en yacimiento..."
          />
          <button class="btn btn-primary" @click="enviarReprogramacion(t.id)">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

<style scoped>
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 1.5rem; }
.card { background: #fff; padding: 1.5rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
h2 { font-size: 1.15rem; margin-bottom: 1rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
.qr-box { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.4rem; }
.qr-img { width: 180px; height: 180px; max-width: 100%; margin: 0.5rem 0; border: 1px solid #e2e8f0; border-radius: 8px; }
.qr-actions { display: flex; gap: 0.5rem; margin-top: 0.85rem; flex-wrap: wrap; justify-content: center; width: 100%; }
.empty-state { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 1.25rem; text-align: center; color: #475569; font-size: 0.9rem; }
.empty-state strong { display: block; color: #0f172a; margin-bottom: 0.35rem; }
.item-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.item-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.reprog-box { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.reprog-box input { flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge-ok { background: #dcfce7; color: #166534; }
.badge-err { background: #fee2e2; color: #991b1b; }
.badge-info { background: #dbeafe; color: #1e40af; }
.btn { display: inline-block; padding: 0.5rem 0.85rem; border: none; border-radius: 6px; font-weight: 600; font-size: 0.82rem; cursor: pointer; text-decoration: none; }
.btn-success { background: #16a34a; color: #fff; }
.btn-warning { background: #f59e0b; color: #fff; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-outline { background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }
.muted { color: #64748b; font-size: 0.9rem; }
</style>
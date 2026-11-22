import { defineStore } from 'pinia';
import http from '../api/http';

export type RolUsuario = 'SUPERADMIN' | 'MEDICO' | 'RECEPCION' | 'EMPRESA' | 'PACIENTE';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  rol: RolUsuario;
  email?: string;
  dni?: string;
  sede?: string | null;
  empresaId?: string | null;
  empresa?: { id: string; razonSocial: string; cuit?: string } | null;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('cp_token') || '',
    usuario: (JSON.parse(localStorage.getItem('cp_usuario') || 'null') as UsuarioSesion | null),
  }),

  getters: {
    estaAutenticado: (state) => !!state.token && !!state.usuario,
    rolActual: (state) => state.usuario?.rol || null,
  },

  actions: {
    async loginCorporativo(email: string, password: string) {
      const { data } = await http.post('/auth/login', { email, password });
      this.guardarSesion(data.token, data.usuario);
    },

    async loginOperarioDNI(dni: string) {
      const { data } = await http.post('/auth/login-operario', { dni });
      const usuarioNormalizado: UsuarioSesion = {
        id: data.operario.id,
        nombre: data.operario.nombre,
        dni: data.operario.dni,
        rol: 'PACIENTE',
        empresa: data.operario.empresa,
      };
      this.guardarSesion(data.token, usuarioNormalizado);
    },

    guardarSesion(token: string, usuario: UsuarioSesion) {
      this.token = token;
      this.usuario = usuario;
      localStorage.setItem('cp_token', token);
      localStorage.setItem('cp_usuario', JSON.stringify(usuario));
    },

    cerrarSesion() {
      this.token = '';
      this.usuario = null;
      localStorage.removeItem('cp_token');
      localStorage.removeItem('cp_usuario');
    },
  },
});
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore, RolUsuario } from '../stores/authStore';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import VerificarCredencialView from '../views/VerificarCredencialView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { publica: true },
    },
    {
      path: '/verificar/:dni?',
      name: 'verificar-credencial',
      component: VerificarCredencialView,
      meta: { publica: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiereAuth: true,
        rolesPermitidos: ['SUPERADMIN', 'MEDICO', 'RECEPCION', 'EMPRESA', 'PACIENTE'] as RolUsuario[],
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiereAuth && !auth.estaAutenticado) {
    return '/login';
  }

  if (to.path === '/login' && auth.estaAutenticado) {
    return '/';
  }

  const rolesPermitidos = to.meta.rolesPermitidos as RolUsuario[] | undefined;
  if (rolesPermitidos && auth.rolActual && !rolesPermitidos.includes(auth.rolActual)) {
    return '/login';
  }

  return true;
});

export default router;
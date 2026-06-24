import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import NosotrosPage from '../views/NosotrosPage.vue'
import CursosPage from '../views/CursosPage.vue'
import CursoDetallePage from '../views/CursoDetallePage.vue'
import InscripcionPage from '../views/InscripcionPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegistroPage from '../views/RegistroPage.vue'
import AdminLoginPage from '../views/AdminLoginPage.vue'
import AdminInscripcionesPage from '../views/AdminInscripcionesPage.vue'
import AdminCursosPage from '../views/AdminCursosPage.vue'
import AdminCursoAlumnosPage from '../views/AdminCursoAlumnosPage.vue'
import AdminGaleriaPage from '../views/AdminGaleriaPage.vue'
import AdminNosotrosPage from '../views/AdminNosotrosPage.vue'
import CuentaPage from '../views/CuentaPage.vue'
import MisSolicitudesPage from '../views/MisSolicitudesPage.vue'
import PagoSolicitudPage from '../views/PagoSolicitudPage.vue'
import GaleriaPage from '../views/GaleriaPage.vue'
import NotFoundPage from '../views/NotFoundPage.vue'
import { getStoredToken, getAdminToken } from '../lib/api'

const routes = [
  { path: '/', name: 'home', component: HomePage, meta: { title: 'Academia EFE | Inicio' } },
  { path: '/nosotros', name: 'nosotros', component: NosotrosPage, meta: { title: 'Nosotros | Academia EFE' } },
  { path: '/cursos', name: 'cursos', component: CursosPage, meta: { title: 'Cursos | Academia EFE' } },
  { path: '/galeria', name: 'galeria', component: GaleriaPage, meta: { title: 'Galería | Academia EFE' } },
  {
    path: '/cursos/:slug',
    name: 'curso-detalle',
    component: CursoDetallePage,
    meta: { title: 'Curso | Academia EFE' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { title: 'Iniciar sesión | Academia EFE', guestOnly: true },
  },
  {
    path: '/registro',
    name: 'registro',
    component: RegistroPage,
    meta: { title: 'Crear cuenta | Academia EFE', guestOnly: true },
  },
  {
    path: '/inscripcion',
    name: 'inscripcion',
    component: InscripcionPage,
    meta: { title: 'Inscripción | Academia EFE', requiresAuth: true },
  },
  {
    path: '/cuenta',
    name: 'cuenta',
    component: CuentaPage,
    meta: { title: 'Mi cuenta | Academia EFE', requiresAuth: true },
  },
  {
    path: '/mis-solicitudes',
    name: 'mis-solicitudes',
    component: MisSolicitudesPage,
    meta: { title: 'Mis solicitudes | Academia EFE', requiresAuth: true },
  },
  {
    path: '/mis-solicitudes/:id/pago',
    name: 'mis-solicitudes-pago',
    component: PagoSolicitudPage,
    meta: { title: 'Pago de solicitud | Academia EFE', requiresAuth: true },
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginPage,
    meta: { title: 'Admin | Academia EFE' },
  },
  {
    path: '/admin/inscripciones',
    name: 'admin-inscripciones',
    component: AdminInscripcionesPage,
    meta: { title: 'Inscripciones (admin) | Academia EFE', requiresAdminRoute: true },
  },
  {
    path: '/admin/cursos',
    name: 'admin-cursos',
    component: AdminCursosPage,
    meta: { title: 'Cursos (admin) | Academia EFE', requiresAdminRoute: true },
  },
  {
    path: '/admin/cursos/:id/alumnos',
    name: 'admin-curso-alumnos',
    component: AdminCursoAlumnosPage,
    meta: { title: 'Alumnos por curso (admin) | Academia EFE', requiresAdminRoute: true },
  },
  {
    path: '/admin/galeria',
    name: 'admin-galeria',
    component: AdminGaleriaPage,
    meta: { title: 'Galería (admin) | Academia EFE', requiresAdminRoute: true },
  },
  {
    path: '/admin/nosotros',
    name: 'admin-nosotros',
    component: AdminNosotrosPage,
    meta: { title: 'Nosotros (admin) | Academia EFE', requiresAdminRoute: true },
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage, meta: { title: 'Página no encontrada | Academia EFE' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to, _from, next) => {
  const tokenAlumno = getStoredToken()
  const tokenAdmin = getAdminToken()

  if (to.meta.requiresAdminRoute && !tokenAdmin) {
    return next({ path: '/admin/login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAuth && !tokenAlumno) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guestOnly && tokenAlumno) {
    const dest = typeof to.query.redirect === 'string' ? to.query.redirect : '/inscripcion'
    return next(dest)
  }

  next()
})

router.afterEach((to) => {
  if (to.meta.title) document.title = to.meta.title
})

export default router

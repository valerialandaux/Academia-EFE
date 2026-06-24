<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import UserMenu from './UserMenu.vue'
import { getAdminToken, setAdminToken } from '../lib/api'

const route = useRoute()
const router = useRouter()
const menuAbierto = ref(false)
const userMenuRef = ref(null)
const { isLoggedIn, fetchMe } = useAuth()
const isAdminLoggedIn = computed(() => !!getAdminToken())

onMounted(() => {
  fetchMe()
})

watch(
  () => route.fullPath,
  () => {
    menuAbierto.value = false
    userMenuRef.value?.cerrar?.()
  },
)

function cerrarMenu() {
  menuAbierto.value = false
  userMenuRef.value?.cerrar?.()
}

function salirAdmin() {
  setAdminToken(null)
  cerrarMenu()
  router.push('/')
}

</script>

<template>
  <div class="navbar-wrap">
    <header class="navbar">
      <RouterLink to="/" class="logo logo-brand" @click="cerrarMenu">
        <img src="/images/logo-mejor.png" alt="Logo Academia EFE" class="brand-logo-img" width="40" height="40" /> /*imagenes */
        <span>EFE</span>
      </RouterLink>

      <button
        type="button"
        class="menu-hamburguesa"
        :class="{ activo: menuAbierto }"
        :aria-expanded="menuAbierto"
        aria-label="Menú"
        @click="menuAbierto = !menuAbierto"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="menu-enlaces" :class="{ activo: menuAbierto }" aria-label="Principal">
        <ul>
          <li>
            <RouterLink v-slot="{ href, navigate, isExactActive }" to="/" custom>
              <a
                :href="href"
                class="nav-link"
                :class="{ 'nav-link-active': isExactActive }"
                @click="
                  (e) => {
                    navigate(e)
                    cerrarMenu()
                  }
                "
                >Inicio</a
              >
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/nosotros" class="nav-link" active-class="nav-link-active" @click="cerrarMenu"
              >Nosotros</RouterLink
            >
          </li>
          <li>
            <RouterLink to="/cursos" class="nav-link" active-class="nav-link-active" @click="cerrarMenu"
              >Cursos</RouterLink
            >
          </li>
          <li>
            <RouterLink to="/galeria" class="nav-link" active-class="nav-link-active" @click="cerrarMenu"
              >Galería</RouterLink
            >
          </li>

          <template v-if="isLoggedIn">
            <li>
              <RouterLink
                to="/inscripcion"
                class="btn-cta"
                active-class="btn-cta-active"
                @click="cerrarMenu"
              >
                Inscribirse
              </RouterLink>
            </li>
            <li>
              <UserMenu ref="userMenuRef" />
            </li>
          </template>

          <template v-else-if="isAdminLoggedIn">
            <li>
              <RouterLink
                to="/admin/inscripciones"
                class="btn-cta"
                active-class="btn-cta-active"
                @click="cerrarMenu"
              >
                Panel admin
              </RouterLink>
            </li>
            <li>
              <button type="button" class="nav-link nav-link-btn" @click="salirAdmin">Cerrar sesión</button>
            </li>
          </template>

          <template v-else>
            <li>
              <RouterLink
                to="/login"
                class="btn-cta"
                active-class="btn-cta-active"
                @click="cerrarMenu"
              >
                Iniciar sesión
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/registro" class="nav-link" active-class="nav-link-active" @click="cerrarMenu">
                Crear cuenta
              </RouterLink>
            </li>
          </template>
        </ul>
      </nav>
    </header>
    <div
      class="nav-backdrop"
      :class="{ activo: menuAbierto }"
      aria-hidden="true"
      @click="cerrarMenu"
    />
  </div>
</template>

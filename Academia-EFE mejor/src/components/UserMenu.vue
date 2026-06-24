<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import UserAvatar from './UserAvatar.vue'

const route = useRoute()
const router = useRouter()
const abierto = ref(false)
const wrapRef = ref(null)

const { user, isLoggedIn, logout } = useAuth()

const nombreVisible = computed(() => user.value?.nombre?.trim() || 'Mi cuenta')

watch(
  () => route.fullPath,
  () => {
    abierto.value = false
  },
)

function toggle() {
  abierto.value = !abierto.value
}

function cerrar() {
  abierto.value = false
}

function onDocClick(e) {
  if (!abierto.value || !wrapRef.value) return
  if (!wrapRef.value.contains(e.target)) cerrar()
}

function onKeydown(e) {
  if (e.key === 'Escape') cerrar()
}

function salir() {
  logout()
  cerrar()
  if (route.meta.requiresAuth) {
    router.push('/login')
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})

defineExpose({ cerrar })
</script>

<template>
  <div v-if="isLoggedIn" ref="wrapRef" class="nav-user-menu-wrap">
    <button
      type="button"
      class="nav-user-trigger nav-user-trigger--desk"
      :aria-expanded="abierto"
      aria-haspopup="menu"
      aria-label="Menú de mi cuenta"
      @click.stop="toggle"
    >
      <UserAvatar
        size="sm"
        class="nav-user-trigger-avatar"
        :nombre="user?.nombre"
        :email="user?.email"
        :avatar-url="user?.avatarUrl"
      />
      <span class="nav-user-chevron" :class="{ abierto }" aria-hidden="true"></span>
    </button>

    <div class="nav-user-dropdown" :class="{ activo: abierto }" role="menu">
      <div class="nav-user-dropdown-head">
        <UserAvatar
          size="md"
          :nombre="user?.nombre"
          :email="user?.email"
          :avatar-url="user?.avatarUrl"
        />
        <div class="nav-user-dropdown-meta">
          <strong>{{ nombreVisible }}</strong>
          <span>{{ user?.email }}</span>
        </div>
      </div>

      <div class="nav-user-dropdown-links">
        <RouterLink
          to="/cuenta"
          class="nav-user-dropdown-item nav-user-dropdown-item--perfil"
          role="menuitem"
          @click="cerrar"
        >
          Mi perfil
        </RouterLink>
        <RouterLink to="/mis-solicitudes" class="nav-user-dropdown-item" role="menuitem" @click="cerrar">
          Mis solicitudes
        </RouterLink>
      </div>

      <button type="button" class="nav-user-dropdown-logout" role="menuitem" @click="salir">
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

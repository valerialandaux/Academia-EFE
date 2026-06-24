<script setup>
import { computed, ref, watch } from 'vue'
import { resolveAvatarUrl, inicialesDe } from '../lib/avatar'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  nombre: { type: String, default: '' },
  email: { type: String, default: '' },
  avatarUrl: { type: String, default: null },
})

const { avatarVersion } = useAuth()
const imgFailed = ref(false)

watch(
  () => [props.avatarUrl, avatarVersion.value],
  () => {
    imgFailed.value = false
  },
)

const iniciales = computed(() => inicialesDe(props.nombre, props.email))

const imgSrc = computed(() =>
  resolveAvatarUrl(props.avatarUrl, avatarVersion.value),
)

const mostrarImg = computed(() => imgSrc.value && !imgFailed.value)

const sizeClass = computed(() => `user-avatar--${props.size}`)
</script>

<template>
  <span class="user-avatar" :class="sizeClass">
    <img
      v-if="mostrarImg"
      :src="imgSrc"
      alt=""
      class="user-avatar-img"
      @error="imgFailed = true"
    />
    <span v-else class="user-avatar-iniciales" aria-hidden="true">{{ iniciales }}</span>
  </span>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import UserAvatar from '../components/UserAvatar.vue'
import { siteImages } from '../data/siteImages'
import { useAuth } from '../composables/useAuth'
import { resolveAvatarUrl } from '../lib/avatar'
import CursoPrecio from '../components/CursoPrecio.vue'
import { useContent } from '../composables/useContent'
import { validarNombre, validarTelefono } from '../lib/validacion'

const { user, fetchMe, updatePerfil, uploadAvatar, removeAvatar, descuento, inscripcionesActivas, avatarVersion } =
  useAuth()
const { cursos, fetchCursos } = useContent()

const nombre = ref('')
const telefono = ref('')
const guardando = ref(false)
const subiendoFoto = ref(false)
const cargandoPerfil = ref(true)
const mensajeOk = ref('')
const mensajeError = ref('')
const errores = ref({ nombre: '', telefono: '', foto: '' })
const previewUrl = ref(null)
const archivoPendiente = ref(null)

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

onMounted(async () => {
  cargandoPerfil.value = true
  try {
    await fetchMe()
    await fetchCursos()
    nombre.value = user.value?.nombre || ''
    telefono.value = user.value?.telefono || ''
  } finally {
    cargandoPerfil.value = false
  }
})

function limpiarPreview() {
  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
  archivoPendiente.value = null
}

function onElegirFoto(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  errores.value.foto = ''
  mensajeError.value = ''
  if (!file) return

  const tipo = file.type || ''
  if (!ALLOWED_TYPES.includes(tipo) && !(tipo === 'image/jpg')) {
    errores.value.foto = 'Solo JPG, PNG o WebP.'
    limpiarPreview()
    return
  }
  if (file.size > MAX_AVATAR_BYTES) {
    errores.value.foto = 'La imagen no puede superar 2 MB.'
    limpiarPreview()
    return
  }

  limpiarPreview()
  archivoPendiente.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function guardarFoto() {
  if (!archivoPendiente.value) {
    errores.value.foto = 'Elige una imagen primero.'
    return
  }
  mensajeOk.value = ''
  mensajeError.value = ''
  subiendoFoto.value = true
  try {
    await uploadAvatar(archivoPendiente.value)
    limpiarPreview()
    mensajeOk.value = 'Foto de perfil guardada.'
  } catch (err) {
    mensajeError.value = err.message || 'No se pudo guardar la foto'
  } finally {
    subiendoFoto.value = false
  }
}

async function quitarFoto() {
  mensajeOk.value = ''
  mensajeError.value = ''
  subiendoFoto.value = true
  try {
    await removeAvatar()
    limpiarPreview()
    mensajeOk.value = 'Foto de perfil eliminada.'
  } catch (err) {
    mensajeError.value = err.message || 'No se pudo quitar la foto'
  } finally {
    subiendoFoto.value = false
  }
}

const fotoMostrada = computed(() => {
  if (previewUrl.value) return previewUrl.value
  return resolveAvatarUrl(user.value?.avatarUrl, avatarVersion.value)
})

function validarFormulario() {
  errores.value.nombre = validarNombre(nombre.value)
  errores.value.telefono = validarTelefono(telefono.value, false)
  return !errores.value.nombre && !errores.value.telefono
}

async function onSubmit(e) {
  e.preventDefault()
  mensajeOk.value = ''
  mensajeError.value = ''
  if (!validarFormulario()) return
  guardando.value = true
  try {
    await updatePerfil({ nombre: nombre.value, telefono: telefono.value })
    mensajeOk.value = 'Perfil actualizado correctamente.'
  } catch (err) {
    mensajeError.value = err.message || 'No se pudo guardar'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="pagina-cuenta pagina-login">
    <AppNavbar />

    <header class="page-hero page-hero--compact">
      <img
        class="page-hero-photo"
        :src="siteImages.heroCursos"
        alt=""
        width="1600"
        height="900"
        loading="eager"
        decoding="async"
      />
      <div class="page-hero-bg page-hero-bg--alt" aria-hidden="true" />
      <div class="page-hero-content anim-fade-up">
        <p class="hero-kicker">Mi perfil</p>
        <h1>Mi cuenta</h1>
        <p class="page-hero-lead">Gestiona tu foto, datos de contacto y descuentos activos.</p>
      </div>
    </header>

    <section class="seccion-formulario cuenta-seccion">
      <div class="contenedor-form anim-reveal cuenta-form-wide">
        <div v-if="cargandoPerfil" class="admin-loading">Cargando tu perfil…</div>

        <template v-else>
          <div class="cuenta-avatar-block">
            <div class="cuenta-avatar-preview-wrap">
              <img
                v-if="fotoMostrada"
                :src="fotoMostrada"
                alt="Vista previa de tu foto de perfil"
                class="cuenta-avatar-preview-img"
                @error="mensajeError = 'No se pudo cargar la imagen de perfil.'"
              />
              <UserAvatar
                v-else
                size="lg"
                :nombre="nombre || user?.nombre"
                :email="user?.email"
                :avatar-url="user?.avatarUrl"
              />
            </div>

            <div class="cuenta-avatar-actions">
              <p class="cuenta-email-label">Foto de perfil</p>
              <p class="cuenta-avatar-hint">JPG, PNG o WebP. Máximo 2 MB.</p>
              <label class="btn-fantasma btn-fantasma-inline cuenta-btn-file">
                Elegir imagen
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onElegirFoto" />
              </label>
              <p v-if="errores.foto" class="campo-error" role="alert">{{ errores.foto }}</p>
              <button
                type="button"
                class="btn-enviar cuenta-btn-save-photo"
                :disabled="subiendoFoto || !archivoPendiente"
                @click="guardarFoto"
              >
                {{ subiendoFoto ? 'Guardando…' : 'Guardar foto' }}
              </button>
              <button
                v-if="user?.avatarUrl && !archivoPendiente"
                type="button"
                class="nav-user-dropdown-logout cuenta-btn-remove-photo"
                :disabled="subiendoFoto"
                @click="quitarFoto"
              >
                Quitar foto actual
              </button>
            </div>
          </div>

          <div class="cuenta-perfil-card">
            <UserAvatar size="md" :nombre="user?.nombre" :email="user?.email" :avatar-url="user?.avatarUrl" />
            <div>
              <p class="cuenta-email-label">Correo de la cuenta</p>
              <p class="cuenta-email-valor">{{ user?.email }}</p>
            </div>
          </div>

          <div v-if="descuento?.porcentaje" class="descuento-banner cuenta-descuento">
            <strong>Descuento por iniciar sesión:</strong> {{ descuento.porcentaje }}% en tu próxima
            inscripción mientras uses esta cuenta.
            <span class="descuento-banner-meta">{{ descuento.etiqueta }}</span>
            <span v-if="inscripcionesActivas > 0" class="descuento-banner-meta">
              {{ inscripcionesActivas }} inscripción(es) activa(s)
            </span>
          </div>

          <div v-if="descuento?.porcentaje" class="cuenta-precios-cat">
            <h3 class="cuenta-precios-titulo">Precios en Bs con tu descuento de sesión</h3>
            <p class="cuenta-precios-lead">
              Estos importes se muestran porque iniciaste sesión. Sin cuenta de alumno verías el precio
              completo en el catálogo.
            </p>
            <ul class="cuenta-precios-lista" role="list">
              <li v-for="c in cursos" :key="c.slug" class="cuenta-precios-item">
                <span class="cuenta-precios-nombre">{{ c.titulo }}</span>
                <CursoPrecio
                  v-if="c.precio"
                  :precio="c.precio"
                  size="sm"
                  :porcentaje-override="descuento.porcentaje"
                  :show-guest-hint="false"
                  :show-session-note="false"
                />
              </li>
            </ul>
          </div>

          <p v-if="mensajeOk" class="form-msg form-msg-ok" role="status">{{ mensajeOk }}</p>
          <p v-if="mensajeError" class="form-msg form-msg-error" role="alert">{{ mensajeError }}</p>

          <form novalidate @submit="onSubmit">
            <div class="grupo-input" :class="{ 'grupo-input--error': errores.nombre }">
              <label for="cuenta-nombre">Nombre completo</label>
              <input
                id="cuenta-nombre"
                v-model="nombre"
                type="text"
                maxlength="120"
                placeholder="Tu nombre completo"
                @input="errores.nombre = ''"
              />
              <p v-if="errores.nombre" class="campo-error" role="alert">{{ errores.nombre }}</p>
            </div>
            <div class="grupo-input" :class="{ 'grupo-input--error': errores.telefono }">
              <label for="cuenta-tel">Teléfono</label>
              <input
                id="cuenta-tel"
                v-model="telefono"
                type="tel"
                placeholder="+591 70000000"
                inputmode="tel"
                maxlength="20"
                @input="errores.telefono = ''"
              />
              <p v-if="errores.telefono" class="campo-error" role="alert">{{ errores.telefono }}</p>
            </div>
            <button type="submit" class="btn-enviar" :disabled="guardando">
              {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </form>

          <div class="cuenta-links-foot">
            <RouterLink to="/mis-solicitudes" class="link-arrow">Mis solicitudes →</RouterLink>
            <RouterLink to="/inscripcion" class="link-arrow">Ir a inscripción →</RouterLink>
          </div>
        </template>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

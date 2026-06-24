# Revisión del proyecto — Academia EFE (versión corregida y ampliada)

> Documento basado en la hoja del docente (*Tecnologías Web I Revisiones*), ajustado al proyecto real **Academia EFE** y no solo al nombre genérico del grupo.

---

## Datos del proyecto

| Campo | Valor correcto |
|-------|----------------|
| **Proyecto** | Academia EFE — Plataforma web de cursos de fotografía |
| **Nota referencial** | 88 — Desempeño muy alto (según hoja del docente) |
| **Tipo de aplicación** | SPA (Single Page Application) + API REST + base de datos |

---

## Diagnóstico cualitativo global (mejorado)

El proyecto es **más completo** de lo que sugiere la hoja original del docente. No es solo “HTML/vistas”: incluye **frontend Vue 3**, **backend Node.js/Express**, **base de datos SQLite con Prisma**, **autenticación JWT**, **panel de administración** y **flujo completo de inscripción y pago simulado**.

La experiencia de usuario es consistente en la parte pública (inicio, cursos, galería, nosotros) y en el área privada (cuenta, mis solicitudes, inscripción, admin).

---

## Fortalezas (ampliadas respecto a la hoja del docente)

### Lo que el docente ya señaló (y es cierto)

- **Diseño de vistas claro** — navegación intuitiva, hero sections, catálogo con filtros, panel admin organizado.
- **Gestión de estado eficiente** — composables (`useAuth`, `useContent`), reactividad de Vue 3, tokens en `localStorage`.
- **Documentación adecuada** — existe documentación técnica del stack y flujos.
- **Buen rendimiento** — Vite para build rápido, carga lazy de imágenes, SPA sin recargas completas.

### Lo que la hoja del docente NO menciona pero el proyecto SÍ tiene

- **Arquitectura en capas**: frontend (`src/`) + backend (`server/`) + base de datos (`server/prisma/`).
- **API REST propia** con más de 20 endpoints (`/api/public/...`, `/api/auth/...`, `/api/admin/...`).
- **Autenticación y roles**: alumno (`USER`) y administrador (`ADMIN`) con JWT.
- **Rutas protegidas** en Vue Router (`requiresAuth`, `requiresAdminRoute`).
- **CRUD administrativo**: cursos, galería, contenido “Nosotros”, inscripciones y pagos.
- **Flujo de negocio real**: solicitud → revisión admin → pago alumno → aprobación de pago → curso marcado como inscrito.
- **Validaciones en backend** además del frontend (contraseñas, pagos, estados, comentarios admin).
- **Seguridad básica**: contraseñas con bcrypt, tokens JWT, CORS configurado.

---

## Debilidades (más precisas que en la hoja original)

### 1. Algunas vistas con diseño más básico

**Cierto en parte.** Vistas como login, registro o algunas pantallas de formulario son funcionales pero menos elaboradas visualmente que el home o el catálogo de cursos.

**Ejemplo para exponer:** el panel admin prioriza utilidad sobre diseño decorativo.

### 2. Validaciones “simples” en algunos formularios

**Cierto en parte, pero incompleto como crítica.**

| Área | Qué hay hoy | Qué falta o es mejorable |
|------|-------------|---------------------------|
| Login / registro | email, longitud de contraseña, teléfono | confirmación de contraseña en registro, mensajes más detallados por campo |
| Inscripción | nombre, teléfono, taller requerido | validar formato de correo también en frontend |
| Pago | tarjeta, CVV, QR con regex | no valida fecha de expiración vencida; `window.prompt` en admin para rechazo de pago |
| Admin cursos | `required` en HTML | poca validación de slug/URL de imagen en frontend antes de enviar |

**Importante para la defensa:** las validaciones críticas **sí existen en el backend** (`server/src/index.js`). La debilidad es más en **profundidad y UX de validación en frontend**, no en ausencia total de validación.

### 3. Lo que la hoja original omite como debilidad

- **SQLite** es adecuada para desarrollo/demo, no para producción con muchos usuarios concurrentes.
- **No hay tests automatizados** (unitarios ni de API).
- **Info presencial de cursos** (sede, horario) está en archivo estático (`inscripcionesMeta.js`), no en base de datos ni panel admin.
- **Pagos simulados**, no integración con pasarela real (Stripe, etc.).

---

## Riesgos (mejorados)

| Riesgo (hoja docente) | Aclaración |
|-----------------------|------------|
| Falta de profundidad en validaciones | Afecta sobre todo **experiencia de usuario** si alguien evita el HTML5 del navegador; el backend mitiga parte del riesgo. |
| *(no mencionado)* | Tokens en `localStorage` son estándar en SPAs pero sensibles a XSS si hubiera código malicioso inyectado. |
| *(no mencionado)* | Sin HTTPS en local es normal; en producción debe usarse siempre. |

---

## Recomendaciones (ampliadas)

### Las del docente (mantener)

1. **Mejorar validaciones en formularios complejos** — especialmente inscripción, pago y formularios admin (mensajes por campo, validar antes de `fetch`).
2. **Unificar estilos visuales** — mismo nivel de pulido entre home, auth y admin.

### Recomendaciones adicionales alineadas al proyecto real

3. Mover datos de clases presenciales (sede, horario) a **base de datos** o panel admin.
4. Agregar **tests** de API y de flujos críticos (login, inscripción, pago).
5. Documentar endpoints con **Swagger/OpenAPI** para la exposición.
6. En producción: migrar de SQLite a **PostgreSQL** o MySQL si escala.

---

## Tecnologías — respuesta correcta para la exposición

### Frontend
- Vue 3, Vue Router 4, Vite 6, JavaScript (ES modules), CSS

### Backend
- Node.js, Express 4, Prisma 6, SQLite, JWT, bcryptjs, CORS

### Comunicación
- HTTP + JSON (`fetch`)
- Una **API REST propia** (carpeta `server/`, no hay carpeta `api/`)
- Prefijo de rutas: `/api/...`

---

## Corrección importante sobre la hoja del docente

La hoja dice **"GRUPO: Nanex HTML"**. Eso parece ser el **nombre del grupo/equipo** o una plantilla genérica, **no el nombre del proyecto web**.

Para exponer debes decir:

> “Nuestro proyecto se llama **Academia EFE**. Pertenecemos al grupo [tu grupo]. La aplicación es una SPA con API REST propia, no solo páginas HTML estáticas.”

---

## Texto listo para leer en la exposición (1 minuto)

> Academia EFE es una plataforma web para una academia de fotografía. Usamos **Vue 3** en el frontend y **Node.js con Express** en el backend, con **SQLite y Prisma** para la base de datos.
>
> La página consume **nuestra propia API REST**: no usamos APIs externas para inscripciones ni pagos. Los endpoints están en el servidor, por ejemplo para listar cursos, registrar alumnos, gestionar inscripciones y el panel de administración.
>
> El flujo principal es: el alumno se inscribe, el admin aprueba o rechaza, el alumno envía el pago, el admin confirma el pago, y entonces el sistema muestra en la ficha del curso que ya está inscrito con la información para asistir presencialmente.
>
> Según la revisión del docente, nuestras fortalezas son el diseño de vistas, la gestión de estado y el rendimiento. Las mejoras pendientes son profundizar validaciones en formularios y unificar aún más el diseño visual en todas las pantallas.

---

## Checklist antes de presentar

- [ ] Explicar que es **1 API propia**, no muchas APIs distintas
- [ ] Mencionar **backend + base de datos**, no solo frontend
- [ ] Mostrar flujo inscripción → pago → curso inscrito
- [ ] Reconocer mejora pendiente: validaciones más robustas en frontend
- [ ] Usar nombre correcto: **Academia EFE**

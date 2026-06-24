# Documentacion tecnica del proyecto Academia EFE

## 1) Resumen general de arquitectura

La aplicacion esta dividida en 3 capas:

- `Frontend` en Vue 3 + Vite (carpeta raiz `src/`).
- `Backend API` en Node.js + Express + Prisma (carpeta `server/`).
- `Base de datos` SQLite administrada por Prisma (`server/prisma/schema.prisma` y archivo `dev.db`).

Flujo principal:

1. El frontend llama endpoints REST (`/api/...`).
2. Vite en desarrollo redirige esas llamadas al backend (`localhost:3001`) por proxy.
3. El backend valida auth/permisos, aplica reglas de negocio y lee/escribe en SQLite via Prisma.
4. La respuesta vuelve al frontend y se renderiza en vistas publicas o panel admin.

---

## 2) Frontend: que usa, por que y como

### Stack

- `Vue 3`: framework reactivo para UI por componentes.
- `Vue Router`: rutas SPA (publicas, privadas y admin).
- `Vite`: dev server y build tool rapido.

Dependencias definidas en `package.json` (raiz):

- runtime: `vue`, `vue-router`
- build/dev: `vite`, `@vitejs/plugin-vue`, `concurrently`

### Por que se usa asi

- Vue 3 permite separar por vistas/componentes reutilizables.
- Vue Router permite proteger rutas por rol/sesion.
- Vite reduce tiempos de desarrollo (HMR) y simplifica build.
- `concurrently` permite levantar web + api en un solo comando.

### Estructura funcional del frontend

- `src/views/`: pantallas (home, cursos, detalle, login/registro, admin, etc.).
- `src/components/`: piezas reutilizables (`AppNavbar`, `AppFooter`, `AdminNav`, etc.).
- `src/composables/`: logica compartida:
  - `useAuth.js`: sesion de alumno, perfil, avatar, login/register/logout.
  - `useContent.js`: carga de contenido publico (cursos, galeria, nosotros) con fallback local.
- `src/lib/api.js`:
  - construye URLs API (`apiUrl`),
  - maneja tokens en `localStorage`,
  - expone headers `Authorization`.
- `src/data/`: metadatos y contenido fallback.

### Como se conecta al backend

- En desarrollo, `vite.config.js` define proxy:
  - `/api` -> `http://localhost:3001`
  - `/uploads` -> `http://localhost:3001`
- En produccion se puede usar `VITE_API_URL` para apuntar a dominio API real.

### Autenticacion en frontend

- Alumno:
  - token guardado en `efe_jwt`
  - usuario guardado en `efe_user`
- Admin:
  - token separado en `efe_jwt_admin`
- Rutas protegidas via `src/router/index.js` usando `meta.requiresAuth` y `meta.requiresAdminRoute`.

---

## 3) Backend: que usa, por que y como

### Stack

- `Node.js` + `Express`: API REST.
- `Prisma Client`: acceso tipado a BD.
- `SQLite`: almacenamiento local simple.
- `jsonwebtoken` (JWT): autenticacion stateless.
- `bcryptjs`: hash de contrasenas.
- `cors`: control de origen frontend.
- `dotenv`: carga de variables de entorno.

Dependencias en `server/package.json`.

### Por que se usa asi

- Express + Prisma permiten API clara con poco boilerplate.
- JWT evita sesiones en servidor y simplifica auth por token.
- SQLite acelera desarrollo/local demos sin infraestructura extra.
- Bcrypt evita guardar contrasenas en texto plano.

### Entry point y configuracion

Archivo principal: `server/src/index.js`

Responsabilidades principales:

- inicia Express,
- configura CORS y JSON body parsing,
- expone archivos de avatar por `/uploads`,
- define endpoints publicos, de alumno y de admin,
- aplica middlewares de auth y rol,
- centraliza reglas de negocio de inscripciones/pagos.

Variables de entorno (`server/.env.example`):

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `PORT`
- `CORS_ORIGIN`

### Middlewares de seguridad

- `authMiddleware` (`server/src/middleware/auth.js`):
  - exige `Bearer token`,
  - valida JWT,
  - inyecta `req.user`.
- `requireAdmin`:
  - bloquea si `role !== ADMIN`.
- `optionalAuth`:
  - intenta validar token; si falla continua como anonimo.

### Endpoints principales

#### Publicos

- `GET /api/public/cursos`
- `GET /api/public/galeria`
- `GET /api/public/nosotros`

#### Auth / perfil alumno

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `PATCH /api/me`
- `POST /api/me/avatar`
- `DELETE /api/me/avatar`

#### Inscripciones alumno

- `POST /api/inscripciones` (admite anonimo o alumno con sesion)
- `GET /api/inscripciones/mias`
- `POST /api/inscripciones/:id/pago`

#### Admin

- `GET /api/inscripciones`
- `PATCH /api/inscripciones/:id/estado`
- `PATCH /api/inscripciones/:id/pago-estado`
- CRUD cursos: `/api/admin/cursos`
- CRUD galeria: `/api/admin/galeria`
- contenido nosotros: `/api/admin/nosotros`

### Reglas de negocio destacadas

- Talleres validos: `basica`, `retrato`, `edicion`.
- No se permite duplicar inscripcion activa del mismo alumno al mismo taller.
- Pago solo se registra si la inscripcion fue aprobada por admin.
- Admin solo puede revisar pagos en estado `ENVIADO`.
- Mensajes/comentarios admin tienen minimos de longitud para trazabilidad.

---

## 4) Base de datos: que usa, por que y como

### Tecnologia

- Motor: `SQLite`
- ORM/esquema/migraciones: `Prisma`

Archivo de modelo: `server/prisma/schema.prisma`.

### Modelos principales

- `User`
  - roles `USER` y `ADMIN`
  - perfil de cuenta (nombre, telefono, avatar)
- `Inscripcion`
  - estado de solicitud (`PENDIENTE`, `APROBADA`, `DENEGADA`)
  - estado de pago (`NO_INICIADO`, `ENVIADO`, `APROBADO`, `RECHAZADO`)
  - datos de pago y comentarios admin
  - relacion opcional con `User`
- `Curso`
  - contenido y configuracion (slug, titulo, descripcion, precio, activo, orden)
  - `niveles` y `temas` guardados como JSON string
- `GaleriaItem`
  - obras de alumnos por curso
- `PaginaContenido`
  - CMS simple para pagina "nosotros"

### Seed inicial

`server/prisma/seed.js` crea:

- usuario admin (email/password por env),
- usuario demo alumno,
- cursos base,
- items de galeria base,
- contenido inicial de "nosotros".

---

## 5) Flujo funcional end-to-end (resumen)

### Flujo de alumno

1. Se registra/login (`/api/auth/...`).
2. Envia solicitud de inscripcion (`POST /api/inscripciones`).
3. Admin revisa y aprueba/rechaza.
4. Si aprueban, alumno envia pago (`POST /api/inscripciones/:id/pago`).
5. Admin aprueba/rechaza pago.
6. Frontend refleja estado en:
   - `Mis solicitudes`,
   - `Cursos` (destacado),
   - `Ficha del curso` (si pago aprobado, datos para presencial).

### Flujo de admin

1. Login admin.
2. Revisa cola de inscripciones.
3. Acepta/rechaza con comentario.
4. Revisa pagos enviados y los aprueba/rechaza.
5. Gestiona contenido: cursos, galeria, nosotros.

---

## 6) Comandos utiles del proyecto

### Frontend (raiz)

- `npm run dev` -> web local
- `npm run build` -> build produccion
- `npm run preview` -> previsualizar build

### Full stack desde raiz

- `npm run dev:full` -> web + api al mismo tiempo

### Backend (`server/`)

- `npm run dev` -> API con watch
- `npm run start` -> API normal
- `npm run db:push` -> sincroniza schema en BD
- `npm run db:migrate` -> migraciones prisma
- `npm run db:seed` -> datos iniciales

---

## 7) Decisiones tecnicas y justificacion rapida

- Separar token alumno/admin en frontend evita mezclar sesiones.
- Usar Prisma sobre SQLite mejora mantenibilidad del acceso a datos.
- Endpoints publicos separados de admin reducen riesgo de sobreexponer datos.
- Validaciones de negocio en backend (no solo frontend) protegen integridad.
- Fallback de contenido en frontend mejora resiliencia si API no responde.

---

## 8) Posibles mejoras futuras (recomendado)

- Mover `niveles` y `temas` de JSON string a tablas relacionadas.
- Agregar auditoria de cambios admin (quien aprobo/rechazo y cuando).
- Agregar tests (unitarios + integracion API).
- Agregar manejo de errores centralizado con middlewares.
- Crear Swagger/OpenAPI para documentar endpoints de forma formal.


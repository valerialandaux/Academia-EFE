# Academia EFE — Cómo arrancar en otra PC

Este proyecto tiene **dos partes** que deben estar encendidas a la vez:

1. **Frontend** (Vue + Vite) — puerto `5173`
2. **Backend** (API + base de datos SQLite) — puerto `3001`

## Arranque rápido

Abre **dos terminales** en la carpeta del proyecto:

```powershell
# Terminal 1 — sitio web
npm install
npm run dev
```

```powershell
# Terminal 2 — API y base de datos
cd server
npm install
npx prisma migrate deploy
npx prisma db push
node prisma/seed.js
npm run dev
```

O en **una sola terminal** (si ya instalaste dependencias):

```powershell
npm run dev:full
```

Abre en el navegador: **http://localhost:5173**

## Checklist antes de presentar

1. Ejecutar `npm run dev:full` (web + API a la vez).
2. Verificar que exista `server/prisma/dev.db` o correr `node prisma/seed.js`.
3. Probar login alumno → inscripción → admin aprueba → pago → curso inscrito.
4. Tener anotadas las cuentas de abajo (el login ya no muestra credenciales en producción).

## Cuentas de prueba (después del seed)

| Rol   | Email                    | Contraseña |
|-------|--------------------------|------------|
| Admin | admin@academiaefe.com    | admin123   |
| Alumno| demo@academiaefe.com     | demo123    |

Panel admin: **http://localhost:5173/admin/login**

## Si copiaste el proyecto desde otra computadora

La base de datos real **no** son solo las carpetas `migrations` — es el archivo:

```
server/prisma/dev.db
```

Ese archivo suele **no copiarse** (está en `.gitignore` o queda vacío). Sin él pierdes usuarios e inscripciones.

**Solución:** copia `dev.db` desde la PC antigua a `server/prisma/dev.db` en esta PC.

Si no tienes ese archivo, en la PC nueva la base queda vacía. Ejecuta el seed (arriba) para crear admin y usuario demo.

## Problemas frecuentes

- **“No se puede conectar” / login no hace nada:** el servidor en `server` no está corriendo. Debe verse en consola: `API Academia EFE en http://localhost:3001`.
- **Puerto 3001 ocupado:** cierra otras ventanas de Node o cambia `PORT` en `server/.env`.
- **Solo abres `dist/index.html`:** no funcionará el login; hace falta `npm run dev` + servidor API.

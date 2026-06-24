# Academia EFE

Plataforma web para cursos de fotografía: catálogo, inscripciones, pagos simulados y panel de administración.

## Arranque para la presentación

```powershell
npm install
cd server && npm install && cd ..
npm run dev:full
```

Abre **http://localhost:5173**

Si la base de datos está vacía:

```powershell
cd server
node prisma/seed.js
```

Cuentas de prueba (tras el seed): ver `INICIO.md`.

## Stack

- **Frontend:** Vue 3, Vue Router, Vite
- **Backend:** Node.js, Express, JWT
- **Base de datos:** SQLite + Prisma

## Documentación

- `INICIO.md` — arranque local y cuentas demo
- `DOCUMENTACION_TECNICA.md` — arquitectura y API

## Producción (resumen)

1. `npm run build` — genera `dist/`
2. Configurar `VITE_API_URL` apuntando al servidor API
3. En `server/.env`: `JWT_SECRET`, `CORS_ORIGIN`, `DATABASE_URL`
4. Servir API en puerto 3001 y frontend estático desde `dist/`

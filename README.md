# 🏪 Almacén Manager — PWA

App de gestión de almacén: productos, ventas, stock e ingresos de mercadería.

---

## 🚀 Setup en 5 pasos

### 1. Supabase — Crear la base de datos

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo
2. Andá a **SQL Editor** y pegá el contenido de `SUPABASE_SCHEMA.sql`
3. Ejecutá el script (botón **Run**)
4. Copiá tus credenciales desde **Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 2. Variables de entorno

Creá un archivo `.env` en la raíz:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Deploy en Netlify

1. Subí el proyecto a GitHub
2. Entrá a [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Seleccioná el repo
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Andá a **Site settings → Environment variables** y agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Redeploy

### 4. Instalar como PWA en el Redmi Note 13 Pro+

1. Abrí la URL de Netlify en Chrome
2. Tocá el menú (tres puntos) → **"Añadir a pantalla de inicio"**
3. ¡Listo! Tenés el ícono de la app en tu home

---

## 📱 Funcionalidades

| Tab | Función |
|-----|---------|
| **Venta** | Seleccioná productos, ajustá cantidades, confirmá → descuenta stock automáticamente |
| **Stock** | Listado completo, crear/editar/eliminar productos, ingresar mercadería |
| **Historial** | Ventas del día, totales acumulados, detalle de cada venta |

## 🛠 Stack

- React 18 + Vite
- Supabase (Postgres)
- Netlify (hosting)
- PWA (instalable en Android/iOS)

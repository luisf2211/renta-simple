# Aybar Rent Car — Prototipo Frontend

Prototipo interactivo de una plataforma de gestión de Rent Car. **Esta fase no
usa backend ni base de datos**: todo funciona con datos mock + `localStorage`.

## Stack

Next.js (App Router) · TypeScript strict · Chakra UI · Tailwind CSS · Lucide ·
React Hook Form · Zod.

## Cómo ejecutar

```bash
npm install
npm run dev      # http://localhost:3000
```

Otros scripts:

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # build de producción
```

## Rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Backoffice admin (single-screen): contratos, clientes, vehículos, usuarios, configuración. |
| `/c/[token]` | Experiencia del cliente (mobile-first): revisar → datos → documento → firma → firmado. |
| `/c/[token]/document` | Documento del contrato firmado (2 páginas A4, imprimible). `?print=1` abre el diálogo de impresión. |
| `/verify/[id]` | Verificación de demostración del documento firmado. |

### Escenarios demo

- **A — `/c/demo-ar-1058`**: cliente nuevo, pendiente de firma (flujo completo).
- **B — `/c/demo-ar-1057`**: cliente recurrente, datos precargados.
- **C — `/c/demo-ar-1056`**: ya firmado (abre el documento directamente).
- **D — AR-1055**: entregado (diferencias de acciones en el admin).

Las utilidades demo (restablecer datos, cargar escenarios) están en
**Configuración → Demo**.

## Arquitectura

- `src/types` — modelo de dominio.
- `src/data/mock` — datos de ejemplo (tenant white-label `mockTenant`).
- `src/repositories` — interfaces + implementaciones mock. La UI depende solo de
  la interfaz, de modo que luego se puede añadir `supabase-*.repository.ts` sin
  reescribir la UI.
- `src/store/demo-store.tsx` — estado global + persistencia en `localStorage`.
- `src/features/*` — módulos (contratos, clientes, vehículos, flujo de cliente,
  documento firmado).
- `src/lib` — formato, cálculos, firma/verificación, almacenamiento.

El documento firmado se renderiza desde un **snapshot inmutable**
(`signedSnapshot`) capturado al firmar, por lo que editar datos maestros después
no altera un contrato ya firmado.

## Fuente de datos: mock ↔ Supabase

La app funciona en dos modos, controlados por `NEXT_PUBLIC_DATA_SOURCE` en `.env.local`:

- `mock` — prototipo totalmente offline (datos de ejemplo + `localStorage`).
- `supabase` — conectado a la base de datos real de Aybar.

Toda la lectura/escritura hacia Supabase ocurre en el **servidor** (route handlers
en `src/app/api/*`, usando la `service_role` key). El navegador solo habla con
esa API, por lo que la service key nunca llega al cliente. Auth real queda
pendiente para una fase posterior; mientras tanto se usa el perfil "Christian"
como creador por defecto.

Capas:
- `src/lib/supabase/server.ts` — cliente admin (server-only).
- `src/lib/supabase/service.ts` + `contract-mutations.ts` — lectura y escritura,
  URLs firmadas para imágenes privadas (Storage).
- `src/lib/supabase/mappers.ts` — mapeo entre el esquema real y los tipos de la app.
- `src/repositories/*/supabase-*.repository.ts` — repos que consumen la API,
  misma interfaz que los repos mock (la UI no cambia).

El esquema existente ya incluye ITBIS (18%), numeración de contratos vía RPC,
tokens públicos y snapshots inmutables al firmar.

---

Repositorio: `luisf2211/renta-simple`.

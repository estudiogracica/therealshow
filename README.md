# Fútbol App — Fase 1 a Fase 9 (completa)

App PWA para organizar los partidos de fútbol de tu grupo de amigos.

## Stack
Next.js 14 (App Router) · React · Tailwind CSS · Supabase (Auth + Postgres + Storage) · Vercel

## Qué incluye esta fase
1. **Estructura del proyecto** (App Router, carpetas `app/`, `components/`, `lib/`, `supabase/`)
2. **Configuración de Supabase** (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`)
3. **Base de datos** completa (`supabase/schema.sql`): `profiles`, `matches`, `match_players`, `goals`, vista `player_stats`, RLS y bucket de avatares
4. **Autenticación** con Supabase Auth (email + contraseña) y protección de rutas por middleware
5. **Pantalla de Login** (+ Registro)
6. **Dashboard** inicial con saludo, próximo partido y accesos rápidos

## Puesta en marcha

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. En **SQL Editor**, pega y ejecuta el contenido de `supabase/schema.sql`.
3. Comprueba en **Storage** que se creó el bucket `avatars` (si no, créalo manualmente como público).
4. En **Project Settings > API**, copia la `URL` y la `anon public key`.

### 2. Variables de entorno
```bash
cp .env.local.example .env.local
```
Rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Instalar y ejecutar
```bash
npm install
npm run dev
```
Abre http://localhost:3000 — te llevará a `/login`.

### 3.5 Migración de la Fase 2 (Carta FUT)
En el **SQL Editor** de Supabase, ejecuta también `supabase/migrations/002_player_ratings.sql`.
Crea la vista `player_ratings`, que calcula en vivo los 6 atributos y la media general de cada jugador.

### 4. Crear tu primer administrador
Regístrate desde la app y luego, en el **SQL Editor** de Supabase:
```sql
update public.profiles set role = 'admin' where id = 'PEGA-AQUI-TU-UUID';
```
(El UUID lo encuentras en **Authentication > Users**.)

### 5. Iconos de la PWA
Ya vienen incluidos en `public/icons/` (placeholder). Puedes sustituirlos por vuestro logo manteniendo los mismos nombres y tamaños — ver detalles en la sección "Fase 9" más abajo.

## Estructura de carpetas
```
app/
  (auth)/login/          Pantalla de login
  (auth)/register/       Pantalla de registro
  dashboard/              Área privada (protegida por middleware)
components/
  AuthForm.tsx            Formulario login/registro
  BottomNav.tsx            Navegación inferior
  Logo.tsx                 Identidad visual
lib/supabase/
  client.ts                Cliente para Client Components
  server.ts                Cliente para Server Components
  types.ts                 Tipos de la base de datos
supabase/
  schema.sql                Esquema completo de la BD
middleware.ts                Protección de rutas + refresco de sesión
```

## Qué incluye la Fase 2
- **Listado de jugadores** (`/dashboard/jugadores`) con mini Cartas FUT en grid
- **Ficha de jugador** (`/dashboard/jugadores/[id]`): Carta FUT grande + estadísticas + fecha de alta
- **Edición de perfil** (`/dashboard/perfil/editar`): foto (subida a Supabase Storage), nombre y apodo
- **Carta FUT** (`components/FutCard.tsx`): diseño dorado estilo Ultimate Team, con:
  - Tilt 3D que sigue el cursor/dedo y brillo dinámico (respeta `prefers-reduced-motion`)
  - Barrido de brillo periódico para que también "viva" en móvil sin hover
  - 6 atributos: ⚡ Ritmo, 🎯 Pase, ⚽ Tiro, 🛡 Defensa, 💪 Físico, 🧠 Visión
  - Media general = promedio de los 6 atributos

### Cómo se calculan los atributos (vista `player_ratings`)
La app no registra datos físicos en bruto (velocidad, entradas, sprints...), así que cada
atributo es un **proxy calculado automáticamente** a partir de lo que sí registramos —
goles, asistencias y resultados — y se recalcula solo en cada consulta, sin ningún job manual:

| Atributo | Se basa en |
|---|---|
| ⚡ Ritmo | Goles por partido + partidos jugados |
| 🎯 Pase | Asistencias por partido + participaciones de gol |
| ⚽ Tiro | Goles por partido |
| 🛡 Defensa | % de victorias del equipo (menos % de derrotas) |
| 💪 Físico | Partidos disputados (aguante/continuidad) |
| 🧠 Visión | Asistencias por partido + goles por partido |

Un jugador sin partidos jugados todavía arranca con una carta "rookie" (50 en todo).
En cuanto se registre el primer partido con goles/asistencias (Fase 5-6), la carta se actualiza sola.

## Qué incluye la Fase 3
- **Listado de partidos** (`/dashboard/partidos`): separados en "Próximos" y "Finalizados"
- **Crear partido** (`/dashboard/partidos/nuevo`) — fecha, hora y lugar. Botón flotante (+), **solo visible para admin**
- **Ficha de partido** (`/dashboard/partidos/[id]`) — fecha, hora, lugar, estado y resultado si ya finalizó. Con secciones "en construcción" para Equipos (Fase 4) y Goles/Asistencias (Fase 5-6)
- **Editar partido** (`/dashboard/partidos/[id]/editar`) — cambiar fecha/hora/lugar/estado, **solo admin**
- **Eliminar partido** — con modal de confirmación (borra en cascada equipos y goles asociados), **solo admin**

La protección de "solo admin" está en **dos capas**:
1. La UI oculta los botones de crear/editar/eliminar si `profile.role !== 'admin'`
2. Las políticas RLS de `supabase/schema.sql` bloquean el `insert`/`update`/`delete` en la base de datos aunque alguien manipulase la petición a mano

## Qué incluye la Fase 4
- **Gestión de equipos** (`/dashboard/partidos/[id]/equipos`, solo admin): lista de todos los jugadores registrados con dos botones (C / B) para asignarlos a Equipo Color o Equipo Blanco, o dejarlos sin equipo. Contador en vivo de cuántos hay en cada equipo.
- **Vista de equipos en la ficha del partido**: dos columnas (Color / Blanco) con foto y nombre de cada jugador convocado, visible para todo el grupo. Enlace "Gestionar" solo para admin.
- Un jugador solo puede estar en un equipo por partido (restricción `unique (match_id, player_id)` ya definida en `schema.sql`).
- Al guardar, se sustituye toda la convocatoria del partido de una vez (borra y vuelve a insertar), pensado para partidos pequeños de grupo de amigos.

## Qué incluye la Fase 5
- **Resultado del partido** (`/dashboard/partidos/[id]/resultado`, solo admin): marcador con contadores grandes `+`/`−` para Color y Blanco, pensado para tocar con el pulgar.
- Al guardar, el partido pasa automáticamente a **finalizado** (ya no hace falta tocar el estado a mano).
- Se puede **"quitar el resultado"** para volver el partido a pendiente y corregir un error, con modal de confirmación.
- En la ficha del partido: si no hay resultado, el admin ve un botón "Añadir resultado"; si ya lo hay, se muestra el marcador y un enlace para editarlo.
- Nota: el estado del partido ya **no se edita a mano** desde "Editar partido" — ahora se controla exclusivamente desde la pantalla de Resultado, para que nunca quede un partido "finalizado" sin marcador o viceversa.

## Qué incluye la Fase 6
- **Registrar goles** (`/dashboard/partidos/[id]/goles`, solo admin, requiere partido finalizado + equipos asignados): formulario con jugador (autocompleta el equipo), asistencia opcional (excluye automáticamente al propio goleador) y minuto opcional. Tras añadir un gol, el formulario se limpia para seguir metiendo goles rápido sin perder la pantalla.
- **Lista de goles editable**: cada gol se puede eliminar con confirmación.
- **Ficha pública del partido**: nueva sección "Goles y asistencias" visible para todo el grupo una vez el partido está finalizado.
- 🎉 **Esto es lo que activa de verdad la Carta FUT**: en cuanto se guarda un gol, la vista `player_ratings` (Fase 2) lo recoge automáticamente — sin ningún job ni paso manual — y recalcula media general, 6 atributos y todas las estadísticas del jugador la próxima vez que se consulte su ficha.

## Qué incluye la Fase 7
- **Ranking** (`/dashboard/ranking`): 4 categorías con selector — Goleadores, Asistentes, Partidos jugados, Victorias.
- Podio destacado: el 1º, 2º y 3º puesto se marcan con color (oro/plata/bronce) en el número de posición.
- Cada fila enlaza directamente a la ficha/Carta FUT del jugador.
- Los datos vienen de la vista `player_ratings` (ya creada en la Fase 2), así que el ranking siempre refleja los goles/asistencias/victorias reales sin cálculos adicionales.
- Los jugadores con 0 en la categoría seleccionada no aparecen en la lista, para no llenarla de ceros.

## Qué incluye la Fase 8
En la **ficha de cada jugador** (`/dashboard/jugadores/[id]`), debajo de las estadísticas, ahora hay tres secciones nuevas:
- **Historial de partidos**: los últimos 10 partidos finalizados en los que jugó, con V/E/D calculado automáticamente según su equipo y el resultado, fecha, lugar y marcador. Cada fila enlaza a la ficha del partido.
- **Últimos goles**: sus 5 goles más recientes, con lugar, fecha y minuto.
- **Últimas asistencias**: sus 5 asistencias más recientes, indicando a quién se la dio.

Todo se calcula en el momento a partir de `match_players` y `goals` — no hace falta ninguna tabla ni columna nueva.

## Qué incluye la Fase 9
- **Iconos PWA reales** ya incluidos en `public/icons/` (192, 512 y maskable-512) — un balón verde sobre fondo oscuro, generados como placeholder. Sustitúyelos por vuestro logo cuando lo tengáis; basta con mantener el mismo nombre de archivo y tamaño.
- **Service worker** (`public/sw.js`): cachea los estáticos de Next.js y los iconos, y muestra una pantalla "Sin conexión" (`/offline`) si se pierde la red durante la navegación. **A propósito no cachea las llamadas a Supabase**: los partidos, jugadores y goles siempre se piden en vivo cuando hay conexión, para no mostrar datos desactualizados.
- **Registro automático** del service worker al cargar la app (`components/ServiceWorkerRegister.tsx`).
- **Banner de instalación** (`components/InstallPrompt.tsx`): cuando el navegador permite instalar la PWA, aparece un aviso con botón "Instalar" encima de la barra inferior.
- La app ya cumple los criterios de instalabilidad: manifest válido, iconos 192/512, service worker con `fetch` handler y HTTPS (Vercel lo da automáticamente).

## Desplegar en Vercel
1. Sube el proyecto a un repositorio de GitHub/GitLab/Bitbucket.
2. En [vercel.com](https://vercel.com), **New Project** → importa el repositorio.
3. En **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel detecta Next.js automáticamente, no hace falta configuración extra.
5. Una vez desplegada, entra desde el móvil y comprueba que aparece el aviso de "Instalar app" (Chrome/Android) o usa "Compartir → Añadir a pantalla de inicio" (Safari/iOS, que no soporta el banner automático).

## App completa — resumen de todas las fases
1. Estructura, Supabase, base de datos, autenticación, login y dashboard
2. Jugadores, edición de perfil y Carta FUT (6 atributos calculados automáticamente)
3. Panel admin: crear/editar/eliminar partidos
4. Selección de equipos (Color / Blanco)
5. Resultado del partido
6. Goles y asistencias
7. Ranking (goleadores, asistentes, partidos, victorias)
8. Historial de partidos y actividad reciente en la ficha del jugador
9. PWA instalable + lista para desplegar en Vercel

## Temporadas
Cada partido pertenece a una **temporada** (ej. "Pretemporada 26/27", "Temporada 27/28"), y las estadísticas, el ranking y la Carta FUT se pueden ver por separado para cada una, o como **histórico total** de todas juntas.

- **Gestionar temporadas** (`/dashboard/temporadas`, solo admin): crear temporadas nuevas y marcar cuál está "activa" (los partidos nuevos se asignan a ella por defecto, aunque se puede cambiar la temporada de un partido concreto al crearlo o editarlo).
- **Selector de temporada** (chips horizontales) en **Partidos**, **Ranking** y en la **ficha de cada jugador** — al cambiar de temporada, se recalculan al momento las estadísticas, el ranking y los 6 atributos + media general de la Carta FUT para esa temporada en concreto.
- Un jugador sin partidos todavía en la temporada seleccionada muestra una carta "rookie" (50 en todo), igual que la primera vez que juega.
- **Importante tras esta actualización**: ejecuta también `supabase/migrations/003_seasons.sql` en el SQL Editor de Supabase. Crea la tabla `seasons`, añade la columna `season_id` a `matches`, y crea una temporada por defecto ("Pretemporada 26/27") a la que se asignan automáticamente los partidos que ya tuvierais creados, para que no se pierda nada.

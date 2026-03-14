# astro-cv-mffc

CV / portfolio profesional de **Maria Fernanda Florez Contreras**, construido con Astro 5 y renderizado del lado del servidor (SSR). Incluye un dashboard de administracion protegido con JWT para gestionar todo el contenido desde el navegador.

## Stack

| Capa | Tecnologia |
|------|------------|
| Framework | Astro 5 (SSR, Node.js standalone) |
| Lenguaje | TypeScript (strict) |
| Contenido | Markdown + YAML frontmatter (gray-matter, marked) |
| Autenticacion | JWT con jose (HS256, cookie httpOnly) |
| Validacion | Zod |
| Estilos | CSS con design tokens (paleta "Cielo Profesional") |

## Estructura del proyecto

```
astro-cv-mffc/
├── content/                  # CMS basado en archivos Markdown
│   ├── hero.md               # Nombre, titulo, foto
│   ├── about.md              # Texto "Acerca de"
│   ├── contact.md            # Links de contacto
│   ├── backgrounds.md        # Fondos para timeline
│   ├── experiences/          # Experiencia laboral
│   ├── formations/           # Formacion academica
│   └── skills/               # Habilidades
├── public/images/            # Imagenes estaticas
├── src/
│   ├── components/           # Hero, Navbar, Timeline, SkillsGrid, ContactLinks
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── auth.ts           # Creacion/verificacion de JWT
│   │   ├── content.ts        # Lectura/escritura de Markdown
│   │   └── schemas.ts        # Schemas Zod por coleccion
│   ├── middleware.ts          # Proteccion de rutas /dashboard y /api
│   ├── pages/
│   │   ├── index.astro       # Pagina publica (CV)
│   │   ├── login.astro       # Login de admin
│   │   ├── dashboard/index.astro
│   │   └── api/
│   │       ├── auth/login.ts
│   │       ├── content/[collection].ts
│   │       ├── content/[collection]/[slug].ts
│   │       ├── content/singleton/[name].ts
│   │       └── upload.ts
│   ├── scripts/              # Animaciones, navbar, timeline, dashboard
│   └── styles/
│       ├── global.css        # Design tokens y base
│       └── components/       # CSS por componente
└── astro.config.mjs
```

## Inicio rapido

```bash
npm install
cp .env.example .env          # Configura credenciales
npm run dev                    # http://localhost:4321
```

## Variables de entorno

```env
ADMIN_USER=admin
ADMIN_PASS=changeme
JWT_SECRET=reemplaza-con-un-secreto-de-al-menos-32-caracteres
```

## Comandos

| Comando | Accion |
|---------|--------|
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Build de produccion en `./dist/` |
| `npm run preview` | Preview del build |
| `npx astro check` | Verificacion de tipos |

## API

Todas las rutas de escritura requieren autenticacion (cookie JWT).

### Autenticacion

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/login` | Login con usuario y contrasena |

### Contenido (colecciones)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/content/:collection` | Listar items |
| POST | `/api/content/:collection` | Crear item |
| GET | `/api/content/:collection/:slug` | Obtener item |
| PUT | `/api/content/:collection/:slug` | Actualizar item |
| DELETE | `/api/content/:collection/:slug` | Eliminar item |

### Contenido (singletons)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/content/singleton/:name` | Obtener singleton (hero, about) |
| PUT | `/api/content/singleton/:name` | Actualizar singleton |

### Archivos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/upload` | Subir imagen (FormData) |

## Sistema de contenido

El contenido se almacena como archivos Markdown con frontmatter YAML en la carpeta `/content`.

**Singletons** — archivos unicos en la raiz:
- `hero.md` — nombre, titulo profesional, ruta de foto
- `about.md` — biografia en Markdown
- `contact.md` — array de links (WhatsApp, LinkedIn, Email)
- `backgrounds.md` — URLs de fondos para el timeline

**Colecciones** — carpetas con multiples archivos:
- `experiences/` — cargo, empresa, fechas, jefe, descripcion
- `formations/` — titulo, institucion, ciudad, fechas
- `skills/` — nombre, etiqueta, icono FontAwesome, nivel

Cada coleccion tiene un schema Zod en `src/lib/schemas.ts` que valida los datos antes de escribir.

## Dashboard

Accesible en `/dashboard` tras autenticarse en `/login`. Permite:

- Editar nombre, titulo profesional y foto de perfil (drag & drop)
- Editar la seccion "Acerca de"
- CRUD completo de experiencias, formaciones y habilidades
- Formularios dinamicos generados segun el schema de cada coleccion

## Design system

Paleta **"Cielo Profesional"** definida en `src/styles/global.css`:

- **Navy** — fondos primarios (`#0a1628` a `#30658c`)
- **Sky Blue** — acentos (`#00A3E0`)
- **Coral** — acentos secundarios (`#F4845F`)
- **Neutrals** — Cloud, Mist, Slate, Charcoal

Efectos: glassmorphism, gradientes, sombras en capas, animaciones con Intersection Observer, soporte para `prefers-reduced-motion`.

Tipografia: **DM Sans** (headings) + **Inter** (body).

## Atajos de teclado

| Atajo | Accion |
|-------|--------|
| `Alt+L` | Ir a `/login` |
| `Alt+D` | Ir a `/dashboard` |
| `Alt+H` | Ir a inicio `/` |

## Licencia

Proyecto privado.

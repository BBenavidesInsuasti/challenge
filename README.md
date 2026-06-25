# CosmicVault — Explorador Espacial con IA

> Plataforma fullstack para explorar, curar y enriquecer contenido espacial de la NASA usando IA generativa.

## Stack

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS | Renderizado eficiente, tipado estático, estilos utilitarios sin fricción (el que mejor conozco) |
| **Estado** | Zustand | Liviano (< 1KB), sin boilerplate, API simple comparado con Redux |
| **Backend** | Node.js + Express + TypeScript | Unificar lenguaje con frontend, rendimiento adecuado, ecosistema maduro |
| **BD** | SQLite (better-sqlite3) | Zero configuración, embebido, ideal para un challenge sin infraestructura |
| **Auth** | JWT (jsonwebtoken + bcryptjs) | Stateless, sin sesiones en BD, fácil de escalar |
| **Testing** | Vitest + Supertest + Testing Library | Rápido, compatible con Vite, API moderna |
| **DevOps** | Docker + docker-compose + nginx | Entorno reproducible, reverse proxy para SPA + API |

## Arquitectura

```
cosmicvault/
├── backend/              # API REST (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/  # Lógica de endpoints
│   │   ├── middleware/    # Auth, rate-limit, validación
│   │   ├── models/       # SQLite schema + seed
│   │   ├── routes/       # Definición de rutas
│   │   ├── services/     # NASA API, OpenAI, JWT
│   │   └── utils/        # Config, helpers
│   └── tests/            # Tests de integración
├── frontend/             # SPA (React + Vite)
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas/rutas
│   │   ├── store/        # Zustand stores
│   │   ├── services/     # Cliente Axios
│   │   └── types/        # TypeScript interfaces
│   └── tests/            # Tests unitarios
└── docker-compose.yml    # Orquestación
```

## Funcionalidades

### Core (obligatorias)
- [x] **Búsqueda avanzada** — Filtros por año, rover, cámara, misión
- [x] **Colecciones personalizadas** — CRUD completo, múltiples colecciones por usuario
- [x] **Enriquecimiento con IA** — Datos curiosos, contexto histórico, tags generados por OpenAI
- [x] **Autenticación** — Registro, login JWT, colecciones privadas por usuario

### Diferenciadores (elegí 2)
- [x] **Comparador de imágenes** — Side-by-side con análisis generado por IA
- [x] **Búsqueda semántica** — Exploración por descripción natural en el comparador
- [x] **Exportación a colecciones** — Sistema de guardado con metadata

### Extras
- [x] Dark theme espacial con animaciones
- [x] States de loading, error y vacío en todos los componentes
- [x] Rate limiting en endpoints críticos
- [x] Validación de inputs con Zod
- [x] Docker multi-stage builds
- [x] Demo pre-cargada (demo@demo.com / password123)

## Instalación

### Local (sin Docker)

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npm run dev     # http://localhost:3001

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev     # http://localhost:5173
```

### Docker

```bash
cp .env.example backend/.env
docker-compose up --build
# Frontend: http://localhost:80
# API: http://localhost:3001
```

### Variables de entorno

| Variable | Default | Obligatoria |
|----------|---------|-------------|
| `PORT` | 3001 | No |
| `JWT_SECRET` | (cambiar en prod) | Sí |
| `NASA_API_KEY` | DEMO_KEY | No (gratuita en api.nasa.gov) |
| `OPENAI_API_KEY` | (vacio) | No (fallback a datos mock) |

## APIs externas

| API | Uso | Key requerida |
|-----|-----|---------------|
| [NASA Image & Video Library](https://api.nasa.gov) | Búsqueda de imágenes espaciales | No (DEMO_KEY = 30 req/h) |
| [Mars Rover Photos](https://api.nasa.gov) | Fotos de los rovers en Marte | No (DEMO_KEY = 30 req/h) |
| [OpenAI GPT](https://platform.openai.com) | Enriquecimiento y comparación | Sí (fallback offline) |

**Sin API key de OpenAI**, la app funciona completamente con datos mock realistas.

## Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Decisiones técnicas y trade-offs

### ¿Por qué SQLite y no PostgreSQL?
**Trade-off:** SQLite no escala horizontalmente ni soporta concurrencia pesada.
**Decisión:** Para un challenge técnico sin infraestructura cloud, SQLite es embebido, no requiere servidor, y zero config. Si esto fuera un producto real, migraría a PostgreSQL con Prisma ORM.

### ¿Por qué Zustand y no Redux?
**Trade-off:** Redux tiene más herramientas DevTools y middleware.
**Decisión:** Zustand pesa <1KB, no requiere Provider, y la API es más directa. Para 3 stores simples, Redux es over-engineering.

### ¿Por qué Express y no Fastify/NestJS?
**Trade-off:** Fastify es más rápido; NestJS tiene más estructura.
**Decisión:** Express es el estándar de Node.js, tiene el ecosistema más grande, y el equipo de MindShore probablemente lo conoce. Preferí familiaridad sobre velocidad.

### ¿Por qué OpenAI mock en lugar de fallar?
**Trade-off:** Podría haber documentado cómo integrarlo sin mostrar funcionalidad.
**Decisión:** Quería que la app fuera completamente funcional sin API keys. Los datos mock usan hashing del título para ser determinísticos y relevantes.

### Seguridad
- JWT con expiración de 7 días
- Passwords hasheados con bcryptjs (10 rounds)
- Validación de inputs con Zod (tipos + sanitización)
- Rate limiting por endpoint
- Helmet para headers HTTP seguros
- No se exponen API keys en el frontend
- SQLite con parámetros preparados (no SQL injection)

## Qué mejoraría con más tiempo

1. **WebSockets** — Notificaciones en tiempo real cuando la IA termina de procesar
2. **Paginación infinita** — Scroll infinito con Intersection Observer
3. **Modo offline** — Service Worker + IndexedDB para usar sin conexión
4. **Exportar colección a PDF** — Usando Puppeteer o jsPDF con las imágenes
5. **Timeline interactivo** — Visualización cronológica de imágenes con D3.js
6. **Búsqueda semántica real** — Embeddings con OpenAI + búsqueda vectorial
7. **OAuth social** — Login con Google/GitHub
8. **CI/CD** — GitHub Actions con tests + deploy automático
9. **E2E tests** — Playwright o Cypress para flujos completos
10. **i18n** — Soporte multi-idioma (ES/EN)

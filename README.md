# Práctica SOLID - Empleados y Salarios

API REST para la gestión de empleados y el cálculo de su salario final.

El proyecto **ya fue refactorizado**: pasó de ser un único archivo monolítico a una
arquitectura por capas con responsabilidades separadas, principios SOLID y POO.

## Regla de negocio

El salario final se calcula así:

**salario final = salario base + 2% del salario base por cada año de antigüedad**

Ejemplo:

- Salario base: 1.000.000
- Antigüedad: 5 años
- Adicional: 10%
- Salario final: 1.100.000

---

## Cambios más importantes aplicados

### 1. De monolito a capas (el cambio principal)

**Antes** todo vivía en `src/server.ts` (99 líneas): el schema de Mongoose, la creación
del modelo, las tres rutas de Express, la validación, el cálculo del salario, el acceso a
la base de datos y la conexión a Mongo. Un solo archivo con siete responsabilidades
distintas y sin posibilidad de testear nada de forma aislada.

**Ahora** cada responsabilidad vive en su propia capa:

```
src/
├── app.ts                          # Configura Express, monta rutas y el error handler
├── server.ts                       # Solo arranca: listen + connectDB
├── config/
│   └── db.ts                       # Conexión a MongoDB aislada
├── routes/
│   └── employeeRoutes.ts           # Definición de endpoints + composition root
├── controllers/
│   └── employeeController.ts       # Traduce HTTP <-> servicio
├── services/
│   └── employeeService.ts          # Validaciones y regla de negocio (cálculo salarial)
├── repository/
│   └── employeeRepository.ts       # Único punto de acceso a la base de datos
├── models/
│   └── employeeModel.ts            # Schema y modelo de Mongoose
├── interfaces/
│   ├── employee.ts                 # Contrato de la entidad
│   ├── employeeRepository.ts       # Contrato del repositorio
│   └── employeeService.ts          # Contrato del servicio
└── errorHandler/
    ├── appError.ts                 # Jerarquía de errores de dominio
    └── errorHanlderMiddleware.ts   # Middleware global de errores
```

### 2. POO: clases, inyección de dependencias y contracts

- **`EmployeeService`** y **`EmployeeRepository`** son clases que implementan
  (`implements`) las interfaces `iEmployeeService` e `iEmployeeRepository`. La interfaz
  define *qué* se hace; la clase define *cómo*.
- Las dependencias se **inyectan por constructor**, no se instancian dentro:
  `new EmployeeService(employeeRepository)`. Esto es lo que permite sustituir el
  repositorio real por un mock en los tests.
- **`appError.ts`** introduce una jerarquía de errores de dominio:
  `AppError` (base, con `statusCode`) → `NotFoundError` (404) y `BadRequestError` (400).
  Incluye `Object.setPrototypeOf(this, new.target.prototype)` para que `instanceof`
  siga funcionando correctamente tras la compilación de TypeScript.

### 3. Manejo de errores centralizado

**Antes** cada ruta repetía el mismo `try/catch` con su `console.error` y su
`res.status(500).json({ message: 'Error interno del servidor' })`.

**Ahora** los controladores delegan con `next(error)` y un único middleware
(`ErrorHandler`, registrado al final en `app.ts`) decide la respuesta:

- Si el error es un `AppError` → responde con su `statusCode` y su mensaje.
- Si es un error desconocido → loguea y responde `500`.

### 4. Separación de conexión a la base de datos y arranque del servidor

`src/config/db.ts` expone `connectDB()`, y `src/server.ts` quedó reducido al arranque.
Antes la conexión estaba encadenada con `.then()` junto al `app.listen`, mezclando dos
preocupaciones en el mismo bloque.

### 5. Bugs corregidos durante la refactorización

| Problema | Causa | Solución |
|---|---|---|
| `this` perdido en los handlers | Los métodos del controller pasaban como referencia a `router.post(...)`, perdiendo el contexto de instancia | Se declararon como **arrow functions** (campos de clase) en `employeeController.ts` |
| El `id` se trataba como `number` | `req.params.id` se casteaba a número, rompiendo el formato `ObjectId` de Mongo | Se castea a **`string`** en controller, service, repositorio y ambas interfaces |
| No conectaba a MongoDB | La imagen `mongo:8` era incompatible con el kernel de Linux en uso | Se fijó **`mongo:7`** en `docker-compose.yml` y en la URI |

### 6. Otras mejoras

- El schema de Mongoose ahora está tipado con el genérico `<iEmployee>`, así el modelo
  queda atado al contrato de la entidad.
- La entidad define `createEmployee = Omit<iEmployee, "finalSalary">`: el cliente no
  puede enviar el salario final, lo calcula el servicio.
- TypeScript en modo `strict` con `module`/`moduleResolution` en `NodeNext`.

---

## Flujo de los datos

### Ciclo de vida de una petición

| # | Capa | Archivo | Qué recibe | Responsabilidad |
|---|---|---|---|---|
| 1 | Servidor | `src/server.ts` | — | `listen(PORT)` y `connectDB()` |
| 2 | App / middlewares | `src/app.ts` | `req` cruda | `express.json()`, monta el router en `/employees`, registra `ErrorHandler` al final |
| 3 | Router | `src/routes/employeeRoutes.ts` | `req` + método/path | Mapea el endpoint al método del controller. Es el *composition root*: instancia repositorio → servicio → controller |
| 4 | Controller | `src/controllers/employeeController.ts` | `req.body` / `req.params` | Traduce HTTP a una llamada de servicio; responde con el status code o delega con `next(error)` |
| 5 | Service | `src/services/employeeService.ts` | datos del empleado / `id` | Valida las reglas de negocio, calcula `finalSalary`, lanza `BadRequestError` o `NotFoundError` |
| 6 | Repository | `src/repository/employeeRepository.ts` | objeto empleado / `id` | Única capa que conoce Mongoose: `create`, `find`, `findById` |
| 7 | Model | `src/models/employeeModel.ts` | — | Schema, tipos y validación de Mongoose |
| 8 | Base de datos | MongoDB (contenedor Docker) | query | Persistencia real de los documentos |
| 9 | Error handler | `src/errorHandler/errorHanlderMiddleware.ts` | `err` | Si es `AppError` responde su `statusCode` y mensaje; si no, `500` |

**Sentido de ida:** `HTTP → app → router → controller → service → repository → model → MongoDB`

**Sentido de vuelta:** el documento de Mongo sube por las mismas capas (repository →
service → controller) y el controller lo serializa con `res.json()`. Si algo falla en
cualquier capa, el error viaja por `next(error)` directo al error handler, sin pasar por
las capas intermedias.

### Recorrido por endpoint

| Endpoint | Recorrido | Respuesta OK | Errores posibles |
|---|---|---|---|
| `POST /employees` | app → router → `controller.create` → `service.create` (valida `name`, `position`, `baseSalary`, `yearsOfService` y calcula `finalSalary`) → `repository.create` → model → Mongo | `201` + empleado creado | `400` si falta nombre/puesto, salario ≤ 0 o antigüedad no entera |
| `GET /employees` | app → router → `controller.findAll` → `service.find` → `repository.find` (`.sort({ createdAt: -1 })`) → model → Mongo | `200` + array de empleados | `404` si no hay empleados registrados |
| `GET /employees/:id` | app → router → `controller.findById` → `service.findById` → `repository.findById` → model → Mongo | `200` + empleado | `404` si no existe un empleado con esa id |

### Forma de los datos

| Etapa | Estructura |
|---|---|
| Body de entrada (POST) | `{ name, position, baseSalary, yearsOfService }` |
| Dentro del servicio | se agrega `finalSalary = baseSalary + (baseSalary * 0.02 * yearsOfService)` |
| Documento en Mongo | los 5 campos + `createdAt` / `updatedAt` (por `timestamps: true`) |
| Respuesta HTTP | el documento completo serializado a JSON, incluido `finalSalary` |

---

## Principios SOLID aplicados

| Principio | Dónde se aplica |
|---|---|
| **S** — Responsabilidad única | Cada archivo tiene una sola razón para cambiar: el controller no valida, el service no conoce Mongoose, el repositorio no arma respuestas HTTP |
| **O** — Abierto/cerrado | Se pueden agregar nuevos endpoints o nuevos tipos de error (`AppError`) sin modificar el middleware existente |
| **L** — Sustitución de Liskov | `EmployeeRepository` es sustituible por cualquier otra implementación de `iEmployeeRepository` sin romper el servicio |
| **I** — Segregación de interfaces | `iEmployeeRepository` e `iEmployeeService` son contratos chicos y específicos, no una interfaz gigante |
| **D** — Inversión de dependencias | `EmployeeService` depende de la abstracción `iEmployeeRepository`, no de la clase concreta; la concreta se inyecta en `routes` |

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/employees` | Crea un empleado y calcula su salario final |
| `GET` | `/employees` | Lista todos los empleados, del más reciente al más antiguo |
| `GET` | `/employees/:id` | Devuelve un empleado por su `ObjectId` |

Ejemplo:

```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","position":"Dev","baseSalary":1000000,"yearsOfService":5}'
```

---

## Cómo ejecutar

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

El `.env` solo necesita dos variables (el `.env.example` ya trae estos valores):

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/employees_db
```

Scripts disponibles: `npm run dev` (con `tsx watch`), `npm run build` (compila a `dist/`)
y `npm start`.

---

## Nota sobre comportamiento observable

La consigna pedía mantener el comportamiento observable de la API. Tras la
refactorización queda **una diferencia** respecto de la versión monolítica:

- `GET /employees` con la base vacía: antes respondía `200` con `[]`, ahora el servicio
  lanza `NotFoundError` y responde `404` ("No hay empleados registrados.").

Todo lo demás se conserva: los mismos endpoints, los mismos códigos de éxito, la misma
fórmula de cálculo y los mismos mensajes de validación del `POST`.

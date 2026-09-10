# Práctica SOLID - Empleados y Salarios

Esta versión funciona, pero está deliberadamente mal estructurada.

## Objetivo

Refactorizar el servidor aplicando una separación clara de responsabilidades:

- controllers
- routes
- services
- repository
- models
- errorHandler

## Regla de negocio

El salario final se calcula así:

**salario final = salario base + 2% del salario base por cada año de antigüedad**

Ejemplo:

- Salario base: 1.000.000
- Antigüedad: 5 años
- Adicional: 10%
- Salario final: 1.100.000

## Endpoints requeridos

- POST /employees
- GET /employees
- GET /employees/:id

## Cómo ejecutar

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

## Consigna

Identificar los problemas del diseño actual y refactorizarlo.
El comportamiento observable de la API debe mantenerse.

# Sistema Frontend para Gestión Clínica

Aplicación web para la gestión de citas médicas e historial clínico, desarrollada como proyecto final del semestre. Consume los endpoints REST del backend desarrollado en las prácticas previas.


## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Vue 3 | 3.4 | Framework principal (Composition API) |
| Vue Router 4 | 4.3 | Navegación entre páginas |
| Vite | 5.0 | Servidor de desarrollo y empaquetador |
| Axios | 1.6 | Llamadas HTTP al backend |


## Requisitos

- Backend .NET corriendo en `http://localhost:5267`

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Levantar en modo desarrollo
npm run dev
```

## Módulos

### Citas Médicas
- Listado de citas con filtros por fecha, estado y paciente
- Registro de nueva cita con validación de campos
- Edición de cita existente
- Cancelación con confirmación
- Validación de citas duplicadas (mismo paciente, misma fecha y hora)
- Indicador de carga en todas las operaciones

### Historial Clínico
- Selector de paciente por historia clínica activa
- Listado de evoluciones ordenadas por fecha descendente
- Registro de nueva evolución con validación de fecha no futura
- Indicador de carga al consultar y guardar

## Endpoints consumidos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/citas` | Listar citas |
| POST | `/api/citas` | Crear cita |
| PUT | `/api/citas/{id}` | Actualizar cita |
| DELETE | `/api/citas/{id}` | Cancelar cita |
| GET | `/api/pacientes` | Listar pacientes |
| GET | `/api/doctores` | Listar doctores |
| GET | `/api/historias-clinicas/activas` | Historias clínicas activas |
| GET | `/api/evoluciones/por-historia/{id}` | Evoluciones por paciente |
| POST | `/api/evoluciones` | Registrar evolución |
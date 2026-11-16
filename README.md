# 🏥 CheckPoint Salud

> **Plataforma web para la autogestión de nóminas corporativas, control automático de vigencias y emisión de certificados de aptitud médica laboral.**

## 🎯 1. Visión general y contexto

CheckPoint Salud centraliza y automatiza la logística de medicina ocupacional entre la clínica (sedes Neuquén Capital y Rincón de los Sauces) y sus empresas clientes.

- **Problema a resolver:** La revisión manual de carpetas físicas genera vencimientos inadvertidos de certificados médicos, provocando el rechazo de trabajadores al intentar ingresar a los yacimientos u obras.

- **Solución principal:** Un motor automatizado de vigencias y alertas preventivas, parametrizado por empresa y puesto laboral.

- **Confidencialidad (Regla de Oro):** Segregación estricta de la información. El personal médico administra el historial clínico; los trabajadores consultan sus turnos; las empresas contratistas **únicamente visualizan el estado de aptitud (Apto / No Apto / Por vencer)** sin acceso a datos médicos sensibles, cumpliendo con la **Ley N° 25.326** de Protección de Datos Personales.

## 📦 2. Alcance y Pilares Funcionales

El sistema se compone de módulos principales diseñados para operar en conjunto:

1. **🔔 Motor de vencimientos y avisos**
   * Parametrización de reglas de vigencia por empresa y puesto de trabajo.
   * Cálculo dinámico de fechas de caducidad.
   * Alertas preventivas y visibilidad en tiempo real en los paneles.

2. **📅 Agenda de turnos multisede**
   * Gestión centralizada de agendas operativas para **Neuquén Capital** y **Rincón de los Sauces**.
   * Procesamiento de cargas masivas de nóminas enviadas por los clientes corporativos (vía `.xlsx`).

3. **🏢 Portal para empresas y recepción**
   * Panel de control para gestión corporativa y atención en clínica.
   * Visualización del estado de aptitud de los empleados y gestión de la nómina activa.
   * Búsqueda rápida por DNI, nombre o empresa y acceso directo de verificación en portería.

4. **🧑‍⚕️ Portal clínico y de consulta (Operario / Portería)**
   * Interfaz médica privada para emisión de dictámenes de aptitud bajo secreto profesional.
   * Vista pública de portería (`/verificar/:dni`) y descarga offline de credenciales QR para zonas de yacimiento sin señal de internet.

## 🏗️ 3. Arquitectura técnica y stack

El proyecto utiliza un entorno tipado de extremo a extremo, estructurado en un esquema monolítico modular con separación clara entre servidor y cliente.

- **Lenguaje Unificado:** TypeScript (TS).
- **Frontend:** Vue.js 3 (Composition API) + Pinia (estado global) + Vue Router + Vite.
- **Backend:** Node.js con Express (API REST, middlewares de seguridad y validación de roles JWT).
- **Base de Datos:** PostgreSQL + Prisma ORM.

## 🗄️ 4. Modelo de Datos Relacional (DER)

La base de datos está optimizada para la alta rotación del sector petrolero y el cumplimiento legal, implementando un diseño relacional robusto.

| Entidad | Descripción y Alcance | 
| ----- | ----- | 
| **Usuarios** | Credenciales de acceso y asignación de rol (`ADMIN`, `MEDICO`, `RECEPCION`, `EMPRESA`, `OPERARIO`). | 
| **Empresas** | Organizaciones clientes (Razón social, CUIT). | 
| **PuestosLaboral** | Catálogo de vigencias (en meses) exigidas para cada puesto. | 
| **Pacientes** | Registro físico del trabajador (Independiente de la empresa para soportar rotación laboral). | 
| **Turnos** | Evento que une al paciente, la sede (`NEUQUEN_CAPITAL`, `RINCON_DE_LOS_SAUCES`), la empresa y el puesto. | 
| **CertificadoApto** | Resultado clínico (`APTO`, `NO_APTO`, `APTO_CON_PREEXISTENCIAS`) con detalle confidencial exclusivo para el rol médico. | 

---

## ⚙️ Guía de Instalación y Ejecución

Para poner en marcha el proyecto localmente, ejecuta los siguientes comandos desde la raíz del repositorio:

```bash
# 1. Instalar dependencias globales / necesarias
npm install
# 2. Iniciar el entorno de desarrollo del frontend
npx vite
# 3. Iniciar el entorno de desarrollo del backend
npm run dev

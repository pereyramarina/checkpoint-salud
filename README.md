# 🏥 CheckPoint Salud

> **Plataforma web para la autogestión de nóminas corporativas, control automático de vigencias y emisión de certificados de aptitud médica laboral.**

---

## 🎯 1. Visión general y contexto

CheckPoint Salud centraliza y automatiza la logística de medicina ocupacional entre la clínica (sedes **Neuquén Capital** y **Rincón de los Sauces**) y sus empresas clientes.

- **Problema a resolver:** La revisión manual de carpetas físicas genera vencimientos inadvertidos de certificados médicos, provocando el rechazo de trabajadores al intentar ingresar a los yacimientos u obras.
- **Solución principal:** Un motor automatizado de vigencias y alertas preventivas, parametrizado por empresa y puesto laboral.
- **Confidencialidad (Regla de Oro):** Segregación estricta de la información. El personal médico administra el historial clínico; los trabajadores consultan sus turnos; las empresas contratistas **únicamente visualizan el estado de aptitud (`Apto` / `No Apto` / `Por vencer`)** sin acceso a datos médicos sensibles, cumpliendo con la **Ley N° 25.326** de Protección de Datos Personales.

---

## 📦 2. Alcance y Pilares Funcionales

El sistema se compone de cuatro módulos principales diseñados para operar de forma integrada:

1. **🔔 Motor de vencimientos y avisos**
   - Parametrización de reglas de vigencia (en meses) por empresa y puesto de trabajo.
   - Cálculo dinámico y automático de fechas de caducidad al emitir cada dictamen.
   - Alertas preventivas y visibilidad en tiempo real en los tableros de gestión.

2. **📅 Agenda de turnos multisede**
   - Gestión centralizada de agendas operativas para **Neuquén Capital** y **Rincón de los Sauces**.
   - Procesamiento y validación de cargas masivas de nóminas enviadas por clientes corporativos (vía planillas `.xlsx`).

3. **🏢 Portal para empresas y recepción**
   - Tablero de control (*Dashboard*) para seguimiento de cumplimiento (*compliance*) corporativo y atención en mostrador.
   - Visualización del estado de aptitud de los empleados y administración de la nómina activa.
   - Búsqueda rápida por DNI, nombre o empresa y acceso directo a la verificación en portería.

4. **🧑‍⚕️ Portal clínico y de consulta (Operario / Portería)**
   - Interfaz médica privada para evaluación clínica y emisión de dictámenes bajo secreto profesional.
   - Vista pública de verificación en portería (`/verificar/:dni`) y descarga offline de credenciales digitales con código QR (PNG) para zonas de yacimiento sin conectividad a internet.

---

## 🏗️ 3. Arquitectura técnica y stack

El proyecto utiliza un entorno tipado de extremo a extremo, estructurado bajo un esquema monolítico modular con separación clara entre cliente y servidor:

- **Lenguaje Unificado:** TypeScript (TS).
- **Frontend:** Vue.js 3 (Composition API) + Pinia (estado global) + Vue Router + Vite.
- **Backend:** Node.js con Express (API REST, middlewares de autenticación JWT y autorización por roles RBAC).
- **Base de Datos:** PostgreSQL + Prisma ORM.

---

## 🗄️ 4. Modelo de Datos Relacional (DER)

La base de datos está optimizada para soportar la alta rotación laboral del sector petrolero y garantizar el cumplimiento legal:

| Entidad | Descripción y Alcance |
| :--- | :--- |
| **Usuarios** | Credenciales de acceso y asignación de rol (`ADMIN`, `MEDICO`, `RECEPCION`, `EMPRESA`, `OPERARIO`). |
| **Empresas** | Organizaciones clientes registradas (Razón social, CUIT y datos de contacto). |
| **PuestosLaboral** | Catálogo de puestos operativos con su período de vigencia exigido (en meses). |
| **Pacientes** | Registro único del trabajador (desacoplado de la empresa para conservar su historial médico ante cambios de empleador). |
| **Turnos** | Evento que vincula al paciente, la sede (`NEUQUEN_CAPITAL` o `RINCON_DE_LOS_SAUCES`), la empresa y el puesto. |
| **CertificadoApto** | Resultado clínico (`APTO`, `NO_APTO`, `APTO_CON_PREEXISTENCIAS`) con observaciones médicas confidenciales exclusivas para el rol médico. |

---

## ⚙️ 5. Guía de Instalación y Ejecución Local

Para poner en marcha el proyecto en una computadora nueva, sigue estos pasos desde la raíz del repositorio:

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Preparar la base de datos en PostgreSQL / pgAdmin 4
1. Verifica que el servicio de **PostgreSQL** esté activo y conectado en **pgAdmin 4** (confirma el puerto en **Properties → Connection** del servidor, habitualmente `5432`).
2. En **pgAdmin 4**, haz clic derecho sobre **Databases → Create → Database...**, crea la base llamada `checkpoint_db` y guárdala.

### Paso 3: Configurar variables de entorno
Crea un archivo llamado `.env` en la raíz del proyecto (este archivo no se sube a Git ya que figura en `.gitignore`):

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/checkpoint_db?schema=public"
JWT_SECRET="una_clave_secreta_segura"
PORT=4000
```

> **Nota:** Reemplaza `usuario`, `contraseña` y el puerto `5432` por los valores reales de tu servidor PostgreSQL local. Por seguridad, nunca subas tus contraseñas reales al repositorio público.

### Paso 4: Aplicar migraciones y levantar la aplicación
```bash
# 1. Aplicar el esquema de Prisma y crear las tablas en checkpoint_db
npx prisma migrate dev

# 2. Iniciar el servidor y el entorno de desarrollo
npm run dev
npx vite
```

Una vez iniciados los servicios, la aplicación estará disponible en `http://localhost:5173`.

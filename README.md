# 📊 E-Ledger | Plataforma de Gestión Financiera Personal

**E-Ledger** es una aplicación web moderna diseñada para el control integral de finanzas personales, desarrollo de balances mensuales, seguimiento de vencimientos y gestión automatizada de reportes contables.

Desarrollado como un proyecto full-stack robusto, orientado a ofrecer una experiencia fluida, diseño responsivo y persistencia de datos segura.

---

## 🚀 Características Principales

* **Sistema de Autenticación y Protección de Rutas:** Gestión de usuarios y control de acceso seguro mediante validaciones de sesión y redireccionamiento por estado.
* **Dashboard Inteligente:** Métricas en tiempo real, cálculo de liquidez disponible, egresos/ingresos mensuales y alertas dinámicas de próximos vencimientos.
* **CRUD Completo:** Interfaz dinámica para registrar, editar, listar y eliminar movimientos financieros de manera intuitiva.
* **Motor de Filtros Dinámicos:** Búsqueda y filtrado avanzado sincronizado directamente con los parámetros de la URL.
* **Biblioteca Histórica & Exportación Contable:** Agrupamiento automático de registros por año y mes con capacidad de exportación directa a formato Excel (CSV).
* **Importador Masivo:** Herramienta de migración para cargar bloques históricos de datos de forma instantánea.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
* **Next.js (App Router):** Framework de React para renderizado híbrido y enrutamiento basado en archivos.
* **React:** Librería principal para la construcción de componentes interactivos.
* **TypeScript:** Tipado estático para garantizar escalabilidad y robustez del código.
* **Tailwind CSS:** Framework de estilos utilitarios para un diseño moderno y adaptable (Responsive Design).

### Backend & Base de Datos
* **API Routes (Next.js):** Endpoints backend creados manualmente para manejar la lógica de negocio, autenticación y procesamiento de datos.
* **Base de Datos / Persistencia:** Modelado de datos relacional y sincronización con almacenamiento local optimizado.

---

## 📂 Estructura del Proyecto

```text
e-ledger/
├── src/
│   ├── app/             # Rutas principales y páginas (App Router)
│   │   ├── api/         # Endpoints de la API creados manualmente (Auth, Users, etc.)
│   │   ├── auth/        # Vista de inicio de sesión y registro con animación 3D
│   │   ├── biblioteca/  # Historial y reportes exportables
│   │   ├── gastos/      # Tabla con motor de filtros avanzados
│   │   └── registrar/   # Formulario CRUD e importador masivo
│   ├── components/      # Componentes reutilizables (Navbar, Footer, etc.)
│   └── ...
├── public/              # Archivos estáticos
└── package.json         # Dependencias y scripts del proyecto
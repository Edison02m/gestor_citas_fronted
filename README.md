# 🗓️ Gestor de Citas - Frontend

Sistema de gestión de citas para negocios con sistema de suscripciones basado en códigos.

## 🚀 Tecnologías

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **React Context API**
- **Axios**

## 📋 Características

### ✅ Sistema de Autenticación
- Login unificado para SuperAdmin y Usuarios
- JWT tokens
- Protección de rutas
- Context API para estado global

### ✅ Registro de Usuarios
- Formulario completo con datos del negocio
- Validaciones en tiempo real
- Creación automática de usuario + negocio

### ✅ Sistema de Suscripciones
- Activación mediante códigos
- Verificación automática de expiración
- Dashboard con estado de suscripción

### ✅ Panel SuperAdmin
- Gestión de códigos de suscripción
- Crear códigos individuales o múltiples
- Estadísticas en tiempo real

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/Edison02m/gestor_citas_fronted.git
cd gestor_citas_fronted

# Instalar dependencias
npm install

# Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Iniciar en desarrollo
npm run dev
```

## 📁 Estructura

```
src/
├── app/                    # Pages (Next.js 14 App Router)
├── components/             # Componentes reutilizables
├── contexts/              # Context API
├── interfaces/            # TypeScript types
├── services/              # API services
└── utils/                 # Utilidades
```

## 🔐 Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🎨 Páginas

- `/` - Landing page (redirige a `/auth`)
- `/auth` - Login y Registro unificados
- `/activar-codigo` - Activar código de suscripción
- `/dashboard` - Panel SuperAdmin
- `/dashboard/codigos` - Gestión de códigos (SuperAdmin)
- `/dashboard-usuario` - Panel de Usuario/Negocio

## 👤 Autor

**Edison Morales**
- GitHub: [@Edison02m](https://github.com/Edison02m)

---

⚡ Desarrollado con Next.js 14 y TailwindCSS

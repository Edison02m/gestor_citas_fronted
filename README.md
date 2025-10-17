# Gestor de Citas - Frontend

## Tecnologías
- Next.js 14+
- TypeScript
- Tailwind CSS

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/           # App Router de Next.js
│   ├── components/    # Componentes reutilizables
│   ├── services/      # Servicios para conectarse al backend
│   ├── interfaces/    # Tipos e interfaces TypeScript
│   └── utils/         # Utilidades
└── public/            # Archivos estáticos
```

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo `.env.local.example` a `.env.local`
2. Configura la URL del backend

## Scripts

- `npm run dev` - Modo desarrollo (http://localhost:3000)
- `npm run build` - Compilar para producción
- `npm start` - Iniciar servidor en producción
- `npm run lint` - Ejecutar linter

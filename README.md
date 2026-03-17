# Catálogo Kosmos

Aplicación web para gestionar y mostrar el catálogo de productos de Kosmos.  
Incluye un panel de administración para crear, editar y eliminar productos, y una interfaz pública para que los usuarios puedan explorar el catálogo y armar su lista.

## Tecnologías

- React
- Vite
- Firebase (Firestore + Auth)
- React Router
- Vercel (deploy)

## Funcionalidades

### Catálogo público
- Visualización de productos
- Detalle de cada producto
- Sección "Mi lista" para guardar productos
- Página de contacto
- Página sobre la marca

### Panel Admin
- Login con Firebase Auth
- Crear productos
- Editar productos
- Eliminar productos
- Manejo de stock

## Estructura del proyecto
- src: 
- components → componentes reutilizables
- pages → páginas de la aplicación
- services → conexión con Firebase
- utils → helpers y utilidades
- context → estado global (ej: lista)
- hooks → hooks personalizados
- styles → estilos globales

## Variables de entorno
Si se utilizan variables para Firebase, agregarlas en `.env`.

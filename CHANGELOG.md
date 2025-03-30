# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-03-30

### Añadido

- **Configuración inicial**
  - Configuración del proyecto con Vite y Vue 3
  - Estructura de directorios organizada
  - Integración con Strapi como backend

- **Autenticación**
  - Sistema de registro de usuarios
  - Sistema de inicio de sesión
  - Manejo de tokens JWT
  - Persistencia de sesión con localStorage
  - Protección de rutas con Vue Router

- **Interfaz de Usuario**
  - Layout principal con header adaptable
  - Tema oscuro para toda la aplicación
  - Diseño responsivo para todos los dispositivos
  - Componentes para formularios de autenticación

- **Página de Inicio**
  - Infinite scroll para cargar noticias automáticamente
  - Visualización de imágenes, títulos y descripciones
  - Reproducción de archivos de audio
  - Función "Leer más" para expandir/contraer descripciones largas
  - Indicadores de carga para mejorar UX
  - Optimización para diferentes tamaños de pantalla

- **Dashboard**
  - Panel de control para usuarios autenticados
  - Visualización de datos del usuario actual

### Mejorado

- Optimización del ancho de pantalla para aprovechar todo el espacio disponible
- Mejora en la legibilidad con líneas de texto más espaciadas
- Ajuste de estilos para una mejor experiencia en modo oscuro

### Corregido

- Problemas de autenticación con Strapi
- Ajustes en la visualización de contenido en pantallas pequeñas
- Corrección de errores en las peticiones HTTP

## [0.0.1] - 2025-03-29

### Añadido

- Configuración inicial del proyecto Vue.js con Vite
- Primeras pruebas de integración con Strapi 
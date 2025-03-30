# Aplicación de Noticias con Vue.js y Strapi

Una aplicación moderna para mostrar noticias con autenticación de usuarios, desarrollada con Vue.js 3 y Strapi como backend.

## Características

- **Diseño Responsivo**: Interfaz adaptable a cualquier dispositivo
- **Tema Oscuro**: Diseño moderno con tema oscuro para mejor experiencia visual
- **Autenticación**: Sistema completo de registro e inicio de sesión con JWT
- **Infinite Scroll**: Carga automática de más noticias al hacer scroll
- **Reproductor de Audio**: Soporte para reproducción de archivos de audio en las noticias
- **Función "Leer más"**: Expansión dinámica del contenido de las noticias
- **Rutas Protegidas**: Acceso controlado a las páginas que requieren autenticación

## Tecnologías Utilizadas

- **Frontend**:
  - Vue.js 3 (Composition API)
  - Vue Router para navegación
  - Pinia para gestión de estado
  - Axios para peticiones HTTP
  - CSS personalizado para estilos

- **Backend**:
  - Strapi Headless CMS
  - Autenticación JWT
  - API RESTful

## Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── LoginForm.vue   # Formulario de inicio de sesión
│   └── RegisterForm.vue # Formulario de registro
├── config/             # Configuración
│   └── strapi.js       # Configuración de Axios para Strapi
├── layouts/            # Layouts de la aplicación
│   └── MainLayout.vue  # Layout principal con header y contenido
├── router/             # Configuración de rutas
│   └── index.js        # Definición de rutas y protección
├── services/           # Servicios
│   └── auth.js         # Servicio de autenticación
├── views/              # Páginas/Vistas
│   ├── Dashboard.vue   # Dashboard (protegido)
│   └── HomePage.vue    # Página de inicio con noticias
├── App.vue             # Componente raíz
└── main.js             # Punto de entrada
```

## Funcionalidades Implementadas

### Autenticación

- Registro de usuarios
- Inicio de sesión
- Cierre de sesión
- Persistencia de sesión con localStorage
- Rutas protegidas

### Sistema de Noticias

- Listado de noticias desde API de Strapi
- Infinite scroll para cargar más noticias
- Visualización de imágenes, textos y fechas
- Reproducción de audios
- Función "Leer más" para expandir/contraer descripciones largas

### Interfaz de Usuario

- Header con navegación contextual
- Diseño responsivo para todos los dispositivos
- Tema oscuro

## Instalación y Configuración

### Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Strapi funcionando en http://localhost:1337

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/mati4315/goldcoast.git
cd goldcoast
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
   Crea un archivo `.env` con la siguiente información:
```
VITE_API_URL=http://localhost:1337
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Uso

1. Accede a `http://localhost:5173` en tu navegador
2. En la página de inicio verás las últimas noticias
3. Regístrate o inicia sesión para acceder al dashboard
4. Navega por las noticias y utiliza la función "Leer más" para ver contenido completo

## Próximas Mejoras

- [ ] Añadir búsqueda de noticias
- [ ] Implementar filtrado por categorías
- [ ] Añadir soporte para comentarios
- [ ] Implementar sistema de notificaciones
- [ ] Añadir tema claro/oscuro configurable

## Licencia

MIT

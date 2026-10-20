// Página de caso en formato "resumen primero": lo esencial se entiende sin hacer
// scroll y el detalle solo aparece si el visitante lo abre. Todo sale de los
// relatos de work-content.ts, resumido; las cifras son conteos reales del
// proyecto, nunca estimaciones.

import type { Localized } from './i18n';

export interface CaseSummary {
  /** Problema, qué hice y resultado: una línea cada uno. */
  problem: Localized;
  did: Localized;
  result: Localized;
  /** Datos duros: valor corto y su etiqueta. */
  facts: Localized<{ value: string; label: string }[]>;
  /** "Profundiza": decisiones y retos, cada uno con 1–2 frases. */
  deep: Localized<{ title: string; body: string }[]>;
}

export const CASE_SUMMARY: Record<string, CaseSummary> = {
  ds: {
    problem: {
      es: 'Cada producto de Global66 construía su propia interfaz.',
      en: 'Each Global66 product built its own interface.',
    },
    did: {
      es: 'Lo consolidé como el design system de la empresa.',
      en: 'I consolidated it as the company design system.',
    },
    result: {
      es: 'Una sola identidad visual en B2C y B2B, y entregas más rápidas.',
      en: 'One visual identity across B2C and B2B, and faster delivery.',
    },
    facts: {
      es: [
        { value: '+12', label: 'componentes documentados' },
        { value: '2', label: 'productos: B2C y B2B' },
        { value: 'A11y', label: 'guías de accesibilidad' },
      ],
      en: [
        { value: '12+', label: 'documented components' },
        { value: '2', label: 'products: B2C and B2B' },
        { value: 'A11y', label: 'accessibility guidelines' },
      ],
    },
    deep: {
      es: [
        { title: 'Tokens antes que componentes', body: 'Color, tipografía y espacio viven en tokens. Cambiar uno actualiza todos los componentes que lo usan.' },
        { title: 'De B2C a B2B', body: 'Llevé la librería a la plataforma de empresas refactorizando el código heredado, sin frenar las entregas.' },
        { title: 'Pruebas automatizadas', body: 'Cada componente tiene pruebas, para que varios equipos lo usen sin miedo a romper algo.' },
      ],
      en: [
        { title: 'Tokens before components', body: 'Color, type and spacing live in tokens. Changing one updates every component that uses it.' },
        { title: 'From B2C to B2B', body: 'I brought the library to the business platform by refactoring legacy code, without slowing delivery.' },
        { title: 'Automated tests', body: 'Every component is tested, so several teams can use it without fear of breaking things.' },
      ],
    },
  },

  multi: {
    problem: {
      es: 'Las empresas tenían que pagar a cada destinatario por separado.',
      en: 'Companies had to pay each recipient separately.',
    },
    did: {
      es: 'Construí el frontend desde cero, de punta a punta.',
      en: 'I built the front-end from scratch, end to end.',
    },
    result: {
      es: 'Pagos masivos en una sola operación, en el producto core.',
      en: 'Bulk payments in a single operation, in the core product.',
    },
    facts: {
      es: [
        { value: '1', label: 'operación para varios envíos' },
        { value: '3', label: 'pasos: crear, validar, confirmar' },
        { value: '0 → 1', label: 'frontend desde cero' },
      ],
      en: [
        { value: '1', label: 'operation for many transfers' },
        { value: '3', label: 'steps: create, validate, confirm' },
        { value: '0 → 1', label: 'front-end from scratch' },
      ],
    },
    deep: {
      es: [
        { title: 'Todo en una tabla', body: 'Montos, cotización y motivo se editan fila por fila, sin salir del resumen.' },
        { title: 'Refactor de la plataforma', body: 'Lideré el refactor visual y de reglas de negocio que la plataforma necesitaba para soportar el flujo.' },
        { title: 'El reto', body: 'Fue el proyecto más complejo de mi paso por Global66, con plazos ajustados.' },
      ],
      en: [
        { title: 'Everything in one table', body: 'Amounts, quote and reason are edited row by row, without leaving the summary.' },
        { title: 'Platform refactor', body: 'I led the visual and business-rule refactor the platform needed to support the flow.' },
        { title: 'The challenge', body: 'It was the most complex project of my time at Global66, with tight deadlines.' },
      ],
    },
  },

  onb: {
    problem: {
      es: 'Registrar una empresa era largo y lleno de fricción.',
      en: 'Signing up a company was long and full of friction.',
    },
    did: {
      es: 'Reconstruí el onboarding B2B y aporté a su definición de producto.',
      en: 'I rebuilt the B2B onboarding and helped define the product.',
    },
    result: {
      es: 'Menos pasos y registros más rápidos.',
      en: 'Fewer steps and faster sign-ups.',
    },
    facts: {
      es: [
        { value: 'IA', label: 'lee los documentos societarios' },
        { value: 'KYC', label: 'verificación con Jumio' },
        { value: '0 → 1', label: 'flujo reconstruido' },
      ],
      en: [
        { value: 'AI', label: 'reads corporate documents' },
        { value: 'KYC', label: 'verification with Jumio' },
        { value: '0 → 1', label: 'flow rebuilt' },
      ],
    },
    deep: {
      es: [
        { title: 'La IA llena el formulario', body: 'Subes la escritura y los accionistas aparecen precargados. La persona solo completa lo que el documento no dice.' },
        { title: 'Identidad con Jumio', body: 'Integré la verificación KYC de los representantes legales dentro del mismo flujo.' },
        { title: 'Menos pasos', body: 'Con producto recortamos y simplificamos los pasos para que registrarse tome menos tiempo.' },
      ],
      en: [
        { title: 'AI fills in the form', body: 'Upload the deed and the shareholders appear prefilled. People only add what the document does not say.' },
        { title: 'Identity with Jumio', body: 'I integrated KYC verification for legal representatives inside the same flow.' },
        { title: 'Fewer steps', body: 'Together with product we cut and simplified the steps so signing up takes less time.' },
      ],
    },
  },

  fv: {
    problem: {
      es: 'Exportadoras de alimentos gestionaban pedidos, datos y vendedores en sistemas sueltos.',
      en: 'Food exporters managed orders, data and sales reps in separate systems.',
    },
    did: {
      es: 'Lideré el frontend: arquitectura, módulos clave e integración con el backend.',
      en: 'I led the front-end: architecture, key modules and backend integration.',
    },
    result: {
      es: 'Una plataforma modular, fácil de mantener y de ampliar.',
      en: 'A modular platform, easy to maintain and extend.',
    },
    facts: {
      es: [
        { value: '3', label: 'capas de Clean Architecture' },
        { value: '4', label: 'módulos clave a mi cargo' },
        { value: 'Excel · CSV · TXT', label: 'fuentes de integración' },
      ],
      en: [
        { value: '3', label: 'Clean Architecture layers' },
        { value: '4', label: 'key modules I owned' },
        { value: 'Excel · CSV · TXT', label: 'integration sources' },
      ],
    },
    deep: {
      es: [
        { title: 'Clean Architecture', body: 'Dominio, infraestructura y UI separados: React queda en el borde y la lógica de negocio no depende de él.' },
        { title: 'Integraciones configurables', body: 'Una interfaz para configurar la integración y un motor que transforma Excel, CSV, TXT o bases de datos.' },
        { title: 'Pedidos y mapas', body: 'Órdenes, devoluciones y recaudos en un módulo, y los recorridos de los vendedores en un mapa.' },
      ],
      en: [
        { title: 'Clean Architecture', body: 'Domain, infrastructure and UI kept apart: React sits at the edge and business logic does not depend on it.' },
        { title: 'Configurable integrations', body: 'A UI to configure each integration and an engine that transforms Excel, CSV, TXT or databases.' },
        { title: 'Orders and maps', body: 'Orders, returns and collections in one module, and sales reps’ routes on a map.' },
      ],
    },
  },

  tramites: {
    problem: {
      es: 'Los trámites del gobierno de Ecuador estaban dispersos y eran lentos.',
      en: 'Government procedures in Ecuador were scattered and slow.',
    },
    did: {
      es: 'Lideré el frontend y un equipo de dos desarrolladores.',
      en: 'I led the front-end and a team of two developers.',
    },
    result: {
      es: 'Trámites centralizados, más rápidos y transparentes.',
      en: 'Centralized procedures, faster and more transparent.',
    },
    facts: {
      es: [
        { value: '4', label: 'pasos por trámite' },
        { value: '2', label: 'desarrolladores a mi cargo' },
        { value: '1', label: 'panel de administración' },
      ],
      en: [
        { value: '4', label: 'steps per procedure' },
        { value: '2', label: 'developers I led' },
        { value: '1', label: 'admin panel' },
      ],
    },
    deep: {
      es: [
        { title: 'Un trámite en 4 pasos', body: 'Datos personales, documentos, notaría y pago, en ese orden y sin salir del flujo.' },
        { title: 'Panel de administración', body: 'Crear y editar trámites, y seguir a los usuarios y lo que han hecho.' },
        { title: 'Calidad', body: 'Pruebas unitarias y de integración, y la documentación completa de la aplicación.' },
      ],
      en: [
        { title: 'A procedure in 4 steps', body: 'Personal data, documents, notary and payment, in that order and without leaving the flow.' },
        { title: 'Admin panel', body: 'Create and edit procedures, and follow users and what they have done.' },
        { title: 'Quality', body: 'Unit and integration tests, and full documentation of the app.' },
      ],
    },
  },

  comp: {
    problem: {
      es: 'El proyecto de fuerza de ventas repetía el mismo código en muchas partes.',
      en: 'The sales force project repeated the same code in many places.',
    },
    did: {
      es: 'Creamos una librería de componentes que se arman a partir de datos.',
      en: 'We built a library of components assembled from data.',
    },
    result: {
      es: 'Menos código repetido y reportes consistentes en todo el sistema.',
      en: 'Less repeated code and consistent reports across the system.',
    },
    facts: {
      es: [
        { value: '4', label: 'componentes dinámicos' },
        { value: 'Storybook', label: 'documentación viva' },
        { value: 'Rollup', label: 'empaquetado optimizado' },
      ],
      en: [
        { value: '4', label: 'dynamic components' },
        { value: 'Storybook', label: 'living documentation' },
        { value: 'Rollup', label: 'optimized bundle' },
      ],
    },
    deep: {
      es: [
        { title: 'El reporte dinámico', body: 'El más complejo: combina tablas, gráficas y mapas en un mismo reporte, generado en tiempo real.' },
        { title: 'Tabla, mapa y filtros', body: 'Cada pieza funciona sola o junto a las demás, configurada solo con datos.' },
      ],
      en: [
        { title: 'The dynamic report', body: 'The most complex one: it combines tables, charts and maps in one report, generated in real time.' },
        { title: 'Table, map and filters', body: 'Each piece works alone or with the others, configured with data only.' },
      ],
    },
  },

  apolo: {
    problem: {
      es: 'Varios proyectos de React necesitaban una misma base visual y funcional.',
      en: 'Several React projects needed the same visual and functional base.',
    },
    did: {
      es: 'Colaboré en la librería con un equipo y desarrollé sus piezas más complejas.',
      en: 'I contributed to the library with a team and built its most complex pieces.',
    },
    result: {
      es: 'Una librería publicada en npm para armar interfaces consistentes rápido.',
      en: 'A library published on npm to build consistent interfaces fast.',
    },
    facts: {
      es: [
        { value: 'npm', label: 'publicada como paquete' },
        { value: 'React', label: 'Storybook y Rollup' },
        { value: 'Motion', label: 'animaciones con Framer Motion' },
      ],
      en: [
        { value: 'npm', label: 'published as a package' },
        { value: 'React', label: 'Storybook and Rollup' },
        { value: 'Motion', label: 'animations with Framer Motion' },
      ],
    },
    deep: {
      es: [
        { title: 'Galería con subida de archivos', body: 'Se adapta a cualquier resolución y permite subir archivos de forma interactiva.' },
        { title: 'Dropdown animado', body: 'Un menú con animaciones suaves en Framer Motion y muchas opciones de personalización.' },
      ],
      en: [
        { title: 'Gallery with file upload', body: 'It adapts to any resolution and lets people upload files interactively.' },
        { title: 'Animated dropdown', body: 'A menu with smooth Framer Motion animations and many customization options.' },
      ],
    },
  },

  ased: {
    problem: {
      es: 'Una empresa de diseño de exteriores necesitaba captar clientes y actualizar su sitio sin depender de nadie.',
      en: 'An outdoor design company needed to win clients and update its site on its own.',
    },
    did: {
      es: 'Hice la landing, el panel de contenido y un chat en tiempo real.',
      en: 'I built the landing, the content panel and a real-time chat.',
    },
    result: {
      es: 'La empresa gestiona su contenido sola y habla directo con sus clientes.',
      en: 'The company manages its own content and talks to clients directly.',
    },
    facts: {
      es: [
        { value: '2', label: 'productos: landing y panel' },
        { value: 'Tiempo real', label: 'chat con Socket.io' },
        { value: 'Full stack', label: 'Next.js y Node.js' },
      ],
      en: [
        { value: '2', label: 'products: landing and panel' },
        { value: 'Real time', label: 'chat with Socket.io' },
        { value: 'Full stack', label: 'Next.js and Node.js' },
      ],
    },
    deep: {
      es: [
        { title: 'Contenido sin programar', body: 'Textos, imágenes y videos se cargan desde una interfaz por secciones, sin conocimientos técnicos.' },
        { title: 'Categorías y subcategorías', body: 'Organizan las soluciones de la empresa, que puede actualizarlas sin pedirle cambios al equipo.' },
      ],
      en: [
        { title: 'Content without code', body: 'Text, images and videos are uploaded from a section-based UI, no technical knowledge needed.' },
        { title: 'Categories and subcategories', body: 'They organize the company’s solutions, which it can update without asking the team.' },
      ],
    },
  },

  blog: {
    problem: {
      es: 'Quería dominar Laravel con un backend real, de punta a punta.',
      en: 'I wanted to master Laravel with a real, end-to-end backend.',
    },
    did: {
      es: 'Construí y desplegué una API REST para un blog.',
      en: 'I built and deployed a REST API for a blog.',
    },
    result: {
      es: 'Una API segura, en la nube, con posts, comentarios y likes.',
      en: 'A secure API in the cloud, with posts, comments and likes.',
    },
    facts: {
      es: [
        { value: 'JWT', label: 'autenticación en cada ruta' },
        { value: '4', label: 'recursos con CRUD' },
        { value: 'fly.io', label: 'desplegada con MongoDB Atlas' },
      ],
      en: [
        { value: 'JWT', label: 'auth on every route' },
        { value: '4', label: 'CRUD resources' },
        { value: 'fly.io', label: 'deployed with MongoDB Atlas' },
      ],
    },
    deep: {
      es: [
        { title: 'Middleware JWT', body: 'Revisa el token de cada petición y rechaza las que no son válidas.' },
        { title: 'Más que un CRUD', body: 'Posts, categorías, comentarios y usuarios, con likes e imágenes en los posts.' },
      ],
      en: [
        { title: 'JWT middleware', body: 'It checks the token on every request and rejects invalid ones.' },
        { title: 'More than CRUD', body: 'Posts, categories, comments and users, with likes and images on posts.' },
      ],
    },
  },
};

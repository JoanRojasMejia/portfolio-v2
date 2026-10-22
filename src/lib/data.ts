import type { Localized } from './i18n';

export const GREET = ['Hola', 'Hello', 'Olá', 'Ciao', 'Bonjour'];
export const ARTISTS = ['Funk Tribu', 'Andrés Calamaro', 'Feid', 'Yandel', 'Quevedo', 'David Guetta', 'Bad Bunny'];
export const LINKS = ['Email', 'LinkedIn', 'GitHub', 'Instagram'];
// Playground: experimentos que viven en este mismo sitio. "live" se prueban ahí
// mismo; "clip" es un video corto porque necesitan otra app para correr.
export const EXPERIMENTS: { id: 'heart' | 'build' | 'wave' | 'ink' | 'sound' | 'tokens'; kind: 'live' | 'clip'; tag: string; title: Localized; hint: Localized }[] = [
  { id:'heart', kind:'live', tag:'Canvas', title:{es:'Onda de corazón',en:'Heart wave'}, hint:{es:'Haz clic dentro del recuadro.',en:'Click inside the box.'} },
  { id:'build', kind:'live', tag:'Canvas', title:{es:'Armado en píxeles',en:'Pixel build'}, hint:{es:'Striky y su gemelo arman la imagen, primero en ASCII.',en:'Striky and a twin build the image, ASCII first.'} },
  { id:'wave', kind:'live', tag:'SVG', title:{es:'Striky saluda',en:'Striky waves'}, hint:{es:'Pasa el cursor. También parpadea sola.',en:'Hover it. It also blinks on its own.'} },
  { id:'ink', kind:'live', tag:'SVG filter', title:{es:'Tinta de marcador',en:'Marker ink'}, hint:{es:'Pasa el cursor para volver a entintar.',en:'Hover to ink it again.'} },
  { id:'sound', kind:'live', tag:'Web Audio', title:{es:'Sonidos sintetizados',en:'Synthesized sounds'}, hint:{es:'Sin archivos de audio: todo es código.',en:'No audio files: it is all code.'} },
  { id:'tokens', kind:'clip', tag:'Tokens', title:{es:'Un token, todo el sistema',en:'One token, the whole system'}, hint:{es:'Cambiar --color-primary repinta cada componente.',en:'Changing --color-primary repaints every component.'} },
];

export interface Project {
  id: string;
  /** g66: proyectos actuales en Global66 (tarjetas grandes) · prev: trabajo previo (índice). */
  group: 'g66' | 'prev';
  featured?: boolean;
  company: Localized;
  period: Localized;
  title: Localized;
  desc: Localized;
  role: Localized;
  /** Texto alternativo de la portada. */
  shot: Localized;
  stack: string;
  contrib: Localized<string[]>;
  /** Lo que sonaba mientras lo hacía. Se busca su preview en iTunes en build time. */
  song?: { artist: string; name: string };
}

// Textos largos, imágenes, año y enlaces de cada proyecto: work-content.ts.
export const PROJECTS: Project[] = [
  // ---- Global66 ----
  { id:'ds', group:'g66', featured:true, company:'Global66', period:{es:'2024–hoy',en:'2024–now'}, title:'Design System Global66', desc:{es:'+12 componentes, tokens y accesibilidad; de B2C a B2B.',en:'12+ components, tokens and accessibility; from B2C to B2B.'}, role:'Lead · Product Engineer', shot:{es:'Componentes del design system de Global66',en:'Global66 design system components'}, song:{artist:'Nelly ft. Kelly Rowland',name:'Dilemma'}, stack:'Vue · Tailwind · Tokens', contrib:{es:['+12 componentes documentados','Tokens de diseño','Guías de accesibilidad','Migración de B2C a B2B','Pruebas automatizadas'],en:['12+ documented components','Design tokens','Accessibility guidelines','Migration from B2C to B2B','Automated tests']} },
  { id:'multi', group:'g66', company:'Global66', period:{es:'2024–hoy',en:'2024–now'}, title:'Multienvío B2B', desc:{es:'Frontend desde cero para crear, validar y confirmar varias transferencias en una sola operación.',en:'Front-end from scratch to create, validate and confirm multiple transfers in a single operation.'}, role:'Product Engineer', shot:{es:'Flujo de multienvío en la plataforma B2B',en:'Bulk transfer flow on the B2B platform'}, song:{artist:'GIVĒON',name:'NUMB'}, stack:'Vue · TypeScript · Tailwind', contrib:{es:['Frontend desde cero','Flujo completo: crear, validar y confirmar','Refactor visual y de reglas de negocio'],en:['Front-end from scratch','Full flow: create, validate and confirm','Visual and business-rule refactor']} },
  { id:'onb', group:'g66', company:'Global66', period:{es:'2024–hoy',en:'2024–now'}, title:{es:'Onboarding de empresas',en:'Business onboarding'}, desc:{es:'Registro B2B rediseñado con KYC y lectura con IA de documentos societarios.',en:'Redesigned B2B sign-up with KYC and AI reading of corporate documents.'}, role:'Product Engineer', shot:{es:'Registro de empresas con verificación KYC',en:'Business sign-up with KYC verification'}, song:{artist:'Ueberrest',name:'Disturbing Paradise'}, stack:'Vue · TypeScript · Tailwind', contrib:{es:['Menos pasos y flujo simplificado','KYC con Jumio','Lectura de documentos con IA'],en:['Fewer steps, simpler flow','KYC with Jumio','AI document reading']} },
  // ---- Trabajo previo ----
  { id:'fv', group:'prev', company:'Celuweb', period:'2022–2024', title:{es:'Fuerza de ventas',en:'Sales force'}, desc:{es:'Plataforma con Clean Architecture para pedidos, integraciones, reportes y mapas.',en:'Clean Architecture platform for orders, integrations, reports and maps.'}, role:{es:'Líder técnico frontend',en:'Front-end tech lead'}, shot:{es:'Plataforma de fuerza de ventas',en:'Sales force platform'}, song:{artist:'Red Hot Chili Peppers',name:'Otherside'}, stack:'React · TypeScript · GraphQL', contrib:{es:['Clean Architecture','Integraciones (Excel, CSV, TXT y bases de datos)','Gestión de pedidos','Mapas de recorridos'],en:['Clean Architecture','Integrations (Excel, CSV, TXT and databases)','Order management','Route maps']} },
  { id:'tramites', group:'prev', company:{es:'GovTech · Ecuador',en:'GovTech · Ecuador'}, period:'2023–2024', title:'Tus Trámites VIP', desc:{es:'Plataforma para centralizar los trámites del gobierno de Ecuador.',en:'Platform to centralize government procedures in Ecuador.'}, role:{es:'Líder técnico frontend',en:'Front-end tech lead'}, shot:{es:'Flujo de trámites de Tus Trámites VIP',en:'Tus Trámites VIP procedure flow'}, song:{artist:'Mikel Erentxun',name:'A un minuto de ti'}, stack:'Vue · Node.js · MongoDB', contrib:{es:['Flujo completo de trámites','Panel de administración','Equipo de 2 desarrolladores','Pruebas unitarias y de integración'],en:['Full procedure flow','Admin panel','Team of 2 developers','Unit and integration tests']} },
  { id:'comp', group:'prev', company:'Celuweb', period:{es:'2023–hoy',en:'2023–now'}, title:{es:'Componentes dinámicos',en:'Dynamic components'}, desc:{es:'Librería de componentes dinámicos para reportes, tablas, mapas y filtros.',en:'Dynamic component library for reports, tables, maps and filters.'}, role:'Front-end', shot:{es:'Reporte dinámico en Storybook',en:'Dynamic report in Storybook'}, song:{artist:'Guns N\' Roses',name:'Knockin\' On Heaven\'s Door'}, stack:'React · Storybook · Rollup', contrib:{es:['Reporte dinámico','Tabla dinámica','Mapa dinámico','Filtros dinámicos'],en:['Dynamic report','Dynamic table','Dynamic map','Dynamic filters']} },
  { id:'apolo', group:'prev', company:{es:'Open source · npm',en:'Open source · npm'}, period:'2024', title:'Apolo UI', desc:{es:'Librería de componentes UI para React, publicada en npm.',en:'UI component library for React, published on npm.'}, role:{es:'Front-end · colaborador',en:'Front-end · contributor'}, shot:{es:'Componentes de Apolo UI',en:'Apolo UI components'}, song:{artist:'Kanye West',name:'I Wonder'}, stack:'React · Storybook · Rollup', contrib:{es:['Galería con subida de archivos','Dropdown animado con Framer Motion','Inputs, botones, modales y alertas'],en:['Gallery with file upload','Animated dropdown with Framer Motion','Inputs, buttons, modals and alerts']} },
  { id:'ased', group:'prev', company:{es:'Cliente · diseño de exteriores',en:'Client · outdoor design'}, period:'2024', title:'ASED', desc:{es:'Landing de captación y plataforma para administrar contenido, con chat en tiempo real.',en:'Lead-generation landing and content admin platform with real-time chat.'}, role:'Full stack', shot:{es:'Landing y panel de ASED',en:'ASED landing and admin panel'}, song:{artist:'Ska-P',name:'Cannabis'}, stack:'Next.js · Node.js · Socket.io', contrib:{es:['Administración dinámica de contenido','Categorías y subcategorías','Chat en tiempo real'],en:['Dynamic content management','Categories and subcategories','Real-time chat']} },
  { id:'blog', group:'prev', company:{es:'Proyecto personal',en:'Personal project'}, period:'2023', title:'Blog API', desc:{es:'API REST en Laravel para un blog, con JWT y MongoDB.',en:'Laravel REST API for a blog, with JWT and MongoDB.'}, role:'Back-end', shot:{es:'Documentación de la API del blog',en:'Blog API documentation'}, song:{artist:'Los Caligaris',name:'Kilómetros'}, stack:'Laravel · MongoDB · JWT', contrib:{es:['Autenticación JWT','CRUD de posts, categorías y comentarios','Likes y subida de imágenes','Despliegue en fly.io'],en:['JWT authentication','CRUD for posts, categories and comments','Likes and image upload','Deployed on fly.io']} },
];

export interface AlbumItem {
  k: 'tattoo' | 'photo' | 'sticker' | 'note';
  src?: string;
  x: number; y: number; w: number; r: number;
  ar?: string;
  no?: string;
  name?: Localized;
  place?: Localized;
  caption?: Localized;
  text?: Localized;
}

// Fotos del álbum: public/assets/album/ (WebP, optimizadas desde las originales).
export const ALBUM: AlbumItem[] = [
  { k:'tattoo', src:'/assets/album/tat-hannya.webp', x:2, y:3, w:18, r:-4, no:'Nº 01', name:'Hannya', place:{es:'espalda',en:'back'} },
  { k:'sticker', src:'/assets/album/st-hoodie.webp', x:21, y:-1, w:11, r:7 },
  { k:'photo', src:'/assets/album/festival.webp', x:33, y:4, w:23, r:-2, ar:'4/3', caption:{es:'con los parceros',en:'with the crew'} },
  { k:'note', x:58, y:4, w:15, r:3, text:{es:'cosas que amo: tatuarme, la música a todo volumen, rodar.',en:'things I love: getting tattooed, loud music, riding.'} },
  { k:'tattoo', src:'/assets/album/tat-sleeve.webp', x:76, y:2, w:18, r:5, no:'Nº 02', name:{es:'Manga floral',en:'Floral sleeve'}, place:{es:'brazo',en:'arm'} },
  { k:'sticker', src:'/assets/album/st-gym.webp', x:1, y:58, w:14, r:-6 },
  { k:'photo', src:'/assets/album/sunset.webp', x:16, y:46, w:14, r:4, ar:'3/4', caption:{es:'atardecer',en:'sunset'} },
  { k:'photo', src:'/assets/album/bike-city.webp', x:31, y:46, w:17, r:-3, ar:'3/4', caption:{es:'la moto · Bogotá',en:'the bike · Bogotá'} },
  { k:'photo', src:'/assets/album/copilot.webp', x:49, y:50, w:13, r:6, ar:'3/4', caption:{es:'copiloto',en:'co-pilot'} },
  { k:'photo', src:'/assets/album/crew-mirror.webp', x:63, y:47, w:13, r:-6, ar:'3/4', caption:{es:'los de siempre',en:'the usual crew'} },
  { k:'sticker', src:'/assets/album/st-water.webp', x:45, y:83, w:9, r:8 },
  { k:'sticker', src:'/assets/album/st-dog.webp', x:77, y:64, w:11, r:-5 },
  { k:'photo', src:'/assets/album/show.webp', x:84, y:46, w:15, r:3, ar:'4/3', caption:{es:'en primera fila',en:'front row'} },
];

// La página completa del álbum: todas las fotos y stickers (los tatuajes tienen su hoja de flash).
export const ALBUM_PAGE: AlbumItem[] = [
  // Fila 1
  { k:'photo', src:'/assets/album/beach-crew.webp', x:1, y:2, w:23, r:-2, ar:'4/3', caption:{es:'atardecer con los parceros',en:'sunset with the crew'} },
  { k:'sticker', src:'/assets/album/st-hoodie.webp', x:23, y:0, w:11, r:7 },
  { k:'photo', src:'/assets/album/mirror.webp', x:35, y:3, w:14, r:3, ar:'3/4', caption:{es:'el espejo',en:'the mirror'} },
  { k:'note', x:51, y:4, w:16, r:-3, text:{es:'cosas que amo: tatuarme, la música a todo volumen, rodar.',en:'things I love: getting tattooed, loud music, riding.'} },
  { k:'photo', src:'/assets/album/setup.webp', x:69, y:1, w:12, r:4, ar:'9/16', caption:{es:'el setup',en:'the setup'} },
  { k:'sticker', src:'/assets/album/st-car.webp', x:83, y:4, w:14, r:-5 },
  // Fila 2
  { k:'sticker', src:'/assets/album/st-gym.webp', x:0, y:24, w:13, r:-6 },
  { k:'photo', src:'/assets/album/gym-crew.webp', x:13, y:21, w:15, r:3, ar:'3/4', caption:{es:'gym con los parceros',en:'gym with the crew'} },
  { k:'photo', src:'/assets/album/friends-selfie.webp', x:30, y:25, w:22, r:-2, ar:'16/9', caption:{es:'con el parcero',en:'with my buddy'} },
  { k:'sticker', src:'/assets/album/st-studio.webp', x:52, y:22, w:12, r:6 },
  { k:'photo', src:'/assets/album/dog-selfie.webp', x:65, y:21, w:11, r:-4, ar:'9/16', caption:'♥' },
  { k:'photo', src:'/assets/album/concert.webp', x:79, y:23, w:15, r:4, ar:'3/4', caption:{es:'concierto',en:'concert'} },
  // Fila 3
  { k:'photo', src:'/assets/album/room.webp', x:2, y:43, w:14, r:-3, ar:'3/4', caption:{es:'en casa',en:'at home'} },
  { k:'sticker', src:'/assets/album/st-water.webp', x:16, y:48, w:10, r:8 },
  { k:'photo', src:'/assets/album/festival.webp', x:27, y:44, w:22, r:2, ar:'4/3', caption:{es:'festival',en:'festival'} },
  { k:'photo', src:'/assets/album/desk.webp', x:50, y:42, w:11, r:-3, ar:'9/16', caption:{es:'donde pasa todo',en:'where it all happens'} },
  { k:'sticker', src:'/assets/album/st-elevator.webp', x:62, y:46, w:11, r:-6 },
  { k:'photo', src:'/assets/album/bike-wash.webp', x:74, y:43, w:12, r:4, ar:'3/5', caption:{es:'día de lavada',en:'wash day'} },
  { k:'sticker', src:'/assets/album/st-round-mirror.webp', x:87, y:47, w:12, r:6 },
  // Fila 4
  { k:'photo', src:'/assets/album/sunset.webp', x:3, y:64, w:14, r:3, ar:'3/4', caption:{es:'atardecer',en:'sunset'} },
  { k:'photo', src:'/assets/album/show.webp', x:19, y:66, w:20, r:-2, ar:'4/3', caption:{es:'en primera fila',en:'front row'} },
  { k:'sticker', src:'/assets/album/st-gym-mirror.webp', x:40, y:64, w:11, r:-5 },
  { k:'photo', src:'/assets/album/bike-city.webp', x:52, y:63, w:14, r:2, ar:'3/4', caption:{es:'la moto · Bogotá',en:'the bike · Bogotá'} },
  { k:'photo', src:'/assets/album/gym.webp', x:68, y:65, w:13, r:-3, ar:'3/4', caption:'gym' },
  { k:'sticker', src:'/assets/album/st-dog.webp', x:83, y:66, w:14, r:6 },
  // Fila 5
  { k:'photo', src:'/assets/album/crew-mirror.webp', x:22, y:83, w:13, r:-2, ar:'3/4', caption:{es:'los de siempre',en:'the usual crew'} },
  { k:'photo', src:'/assets/album/copilot.webp', x:56, y:82, w:11, r:4, ar:'9/16', caption:{es:'copiloto',en:'co-pilot'} },
];

export const FLASH: { no: string; name: Localized; place: Localized; src: string }[] = [
  { no:'Nº 01', name:'Hannya', place:{es:'espalda',en:'back'}, src:'/assets/album/tat-hannya.webp' },
  { no:'Nº 02', name:{es:'Manga floral',en:'Floral sleeve'}, place:{es:'brazo',en:'arm'}, src:'/assets/album/tat-sleeve.webp' },
  { no:'Nº 03', name:'Blackwork', place:{es:'espalda',en:'back'}, src:'/assets/tat-blackwork.jpg' },
  { no:'Nº 04', name:{es:'Manga',en:'Sleeve'}, place:{es:'mano',en:'hand'}, src:'/assets/tat-sleeve-b.jpg' },
];

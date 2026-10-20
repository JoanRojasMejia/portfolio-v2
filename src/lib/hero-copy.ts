// Párrafo de presentación del hero. Va por partes para poder insertar, dentro
// del texto, el chip de Global66 (resaltado con su color) y el enlace a LinkedIn
// de "abierto a nuevos retos": lead · [Global66] · middle · [link] · after.

import type { Lang } from './i18n';

export const LINKEDIN = 'https://www.linkedin.com/in/joan-rojas-mejia/';
export const GLOBAL66 = 'https://www.global66.com/';

interface Intro {
  lead: string;
  middle: string;
  link: string;
  after: string;
}

export const HERO_INTRO: Record<Lang, Intro> = {
  es: {
    lead: 'Product Engineer con más de 6 años construyendo productos fintech. En ',
    middle:
      ' lideré el frontend de los pagos masivos y del nuevo onboarding de empresas, y llevé el design system de B2C a B2B. Hoy estudio Economía y ',
    link: 'estoy abierto a nuevos retos',
    after: '.',
  },
  en: {
    lead: 'Product Engineer with 6+ years building fintech products. At ',
    middle:
      " I led the frontend for bulk payments and the new business onboarding, and took the design system from B2C to B2B. I'm studying Economics and ",
    link: "I'm open to new challenges",
    after: '.',
  },
};

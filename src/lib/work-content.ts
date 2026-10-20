// Contenido de los proyectos, generado desde el portafolio anterior
// (portafolio/src/content/projects.ts): textos en ES/EN, stack, año, enlace e
// imágenes (las que cada proyecto usaba allí). Lo que se muestra en tarjetas y
// fichas vive en data.ts.

export interface WorkContent {
  year: string;
  tags: string[];
  public: boolean;
  link: string | null;
  cover: string;
  gallery: string[];
  /** Archivos de origen en el portafolio anterior, como referencia. */
  source: { cover: string; gallery: string[] };
  story: { es: string[]; en: string[] };
}

export const WORK_CONTENT: Record<string, WorkContent> = {
  "multi": {
    "year": "2024 - now",
    "tags": [
      "Vue",
      "Tailwindcss",
      "TypeScript",
      "Git"
    ],
    "public": false,
    "link": null,
    "cover": "/assets/work/multi.webp",
    "gallery": [
      "/assets/work/multi-1.webp",
      "/assets/work/multi-2.webp",
      "/assets/work/multi-3.webp"
    ],
    "source": {
      "cover": "/project-9.webp",
      "gallery": [
        "/project-9-1.webp",
        "/project-9-2.webp",
        "/project-9-3.webp"
      ]
    },
    "story": {
      "es": [
        "El Multienvío es una de las funcionalidades core de la plataforma B2B de Global66: permite a las empresas crear, validar y confirmar múltiples transferencias en una sola operación. Construí su frontend desde cero, cubriendo el flujo completo, y lideré la refactorización visual y de reglas de negocio que la plataforma necesitaba para soportarlo.",
        "Fue el proyecto más retador de mi paso por Global66 por su complejidad y plazos. El resultado simplificó los pagos masivos para las empresas y mejoró de forma directa la experiencia del cliente en el producto core."
      ],
      "en": [
        "Multienvío is one of the core features of the Global66 B2B platform: it lets companies create, validate and confirm multiple transfers in a single operation. I built its frontend from scratch, covering the complete flow, and led the visual and business-rule refactoring that the platform needed to support it.",
        "It was the most challenging project of my time at Global66 because of its complexity and deadlines. The result simplified bulk payments for companies and directly improved the customer experience in the core product."
      ]
    }
  },
  "onb": {
    "year": "2024 - now",
    "tags": [
      "Vue",
      "Tailwindcss",
      "TypeScript",
      "Git"
    ],
    "public": false,
    "link": null,
    "cover": "/assets/work/onb.webp",
    "gallery": [
      "/assets/work/onb-1.webp",
      "/assets/work/onb-2.webp",
      "/assets/work/onb-3.webp"
    ],
    "source": {
      "cover": "/project-8.webp",
      "gallery": [
        "/project-8-1.webp",
        "/project-8-2.webp",
        "/project-8-3.webp"
      ]
    },
    "story": {
      "es": [
        "Reconstruí desde cero el onboarding de empresas (B2B) de Global66, con aporte directo en la definición de producto: redujimos el número de pasos y simplificamos el flujo para que las empresas se registren más rápido y con menos fricción.",
        "Integré la verificación de identidad (KYC) con Jumio para los representantes legales e incorporé lectura con IA de escrituras y documentos societarios para autocompletar la información de la empresa, reduciendo la fricción y el tiempo de registro."
      ],
      "en": [
        "I rebuilt the Global66 business (B2B) onboarding from scratch, contributing directly to the product definition: we reduced the number of steps and simplified the flow so companies can register faster and with less friction.",
        "I integrated identity verification (KYC) with Jumio for legal representatives and added AI reading of deeds and corporate documents to autofill the company information, reducing friction and registration time."
      ]
    }
  },
  "ds": {
    "year": "2024 - now",
    "tags": [
      "Vue",
      "Tailwindcss",
      "TypeScript",
      "Git"
    ],
    "public": true,
    "link": "https://github.com/Flash-Global66/global-design-system",
    "cover": "/assets/work/ds.webp",
    "gallery": [
      "/assets/work/ds-1.webp"
    ],
    "source": {
      "cover": "/project-7.webp",
      "gallery": [
        "/project-7-1.webp"
      ]
    },
    "story": {
      "es": [
        "Este proyecto es un sistema de diseño desarrollado para Global66, una empresa fintech que ofrece servicios financieros como transferencias de dinero, cambio de divisas y soluciones de pago. El sistema de diseño fue creado para proporcionar una experiencia de usuario consistente y cohesiva en todos los productos digitales de la empresa. Incluye un conjunto completo de componentes reutilizables, pautas de diseño y mejores prácticas para el diseño UI/UX. El sistema fue construido utilizando Vue.js, un popular framework de JavaScript para construir interfaces de usuario, y Tailwind CSS, un framework CSS de utilidad que permite un estilo rápido y flexible. El sistema de diseño está diseñado para ser modular y escalable, lo que permite una fácil integración en proyectos existentes y futuros.",
        "Lo consolidé como el Design System corporativo: tokens de diseño, guías de accesibilidad y más de 12 componentes documentados. Lo llevé del producto B2C a la plataforma B2B, refactorizando código heredado y añadiendo pruebas automatizadas, lo que unificó la identidad visual y aceleró la entrega de funcionalidades en múltiples equipos."
      ],
      "en": [
        "This project is a design system developed for Global66, a fintech company that offers financial services such as money transfers, currency exchange, and payment solutions. The design system was created to provide a consistent and cohesive user experience across all of the company's digital products. It includes a comprehensive set of reusable components, design guidelines, and best practices for UI/UX design. The system was built using Vue.js, a popular JavaScript framework for building user interfaces, and Tailwind CSS, a utility-first CSS framework that allows for rapid and flexible styling. The design system is designed to be modular and scalable, allowing for easy integration into existing and future projects.",
        "I consolidated it as the corporate Design System: design tokens, accessibility guidelines and more than 12 documented components. I took it from the B2C product to the B2B platform, refactoring legacy code and adding automated tests, which unified the visual identity and sped up feature delivery across multiple teams."
      ]
    }
  },
  "fv": {
    "year": "2022 - 2024",
    "tags": [
      "React",
      "Sass",
      "TypeScript",
      "GraphQL",
      "Git"
    ],
    "public": false,
    "link": null,
    "cover": "/assets/work/fv.webp",
    "gallery": [
      "/assets/work/fv-1.webp",
      "/assets/work/fv-2.webp",
      "/assets/work/fv-3.webp"
    ],
    "source": {
      "cover": "/project-1.webp",
      "gallery": [
        "/project-1-1.webp",
        "/project-1-2.webp",
        "/project-1-3.webp"
      ]
    },
    "story": {
      "es": [
        "Este proyecto tiene como objetivo mejorar de manera integral las operaciones de empresas dedicadas a la exportación de alimentos y materias primas. Entre los aspectos clave que se abordaron están: la gestión de pedidos, la administración de usuarios en la plataforma, integraciones con sistemas externos, generación de reportes, creación de dashboards, seguimiento de recorridos a través de mapas, y diversas herramientas operativas adicionales. Mi rol como líder del equipo de desarrollo frontend incluyó la gestión de la arquitectura del proyecto, la organización general, el desarrollo de interfaces de usuario, y la integración con el backend. Además, realicé implementaciones específicas en módulos esenciales, como la gestión de pedidos, integraciones y administración, contribuyendo de manera significativa al éxito del proyecto.",
        "Para este proyecto implementé Clean Architecture, lo que permitió una estructura modular, escalable y fácil de mantener. Dividí el trabajo en tres capas: el dominio, que contiene la lógica central del negocio; la infraestructura, que gestiona la comunicación con el backend a través de repositorios; y la UI, desarrollada en React JS, donde se abstrae el framework para garantizar la reutilización de componentes. Esta organización asegura la independencia entre capas, facilita futuras expansiones y mantiene la integridad del proyecto a lo largo del tiempo.",
        "Desarrollé un módulo fundamental de integraciones modulares que se compone de dos partes clave: configuración y ejecución. La configuración permite establecer los parámetros necesarios para las integraciones a través de una interfaz gráfica de usuario intuitiva. La ejecución procesa y transforma los datos provenientes de archivos como Excel, CSV o TXT, así como de bases de datos, para almacenarlos y organizarlos en la base de datos de la aplicación, asegurando una integración eficiente y estructurada.",
        "Otros modulos clave que desarrollé incluyen el módulo de administradores, que gestiona y configura la información de las bases de datos a través de consultas SQL o tablas; el módulo de gestión de pedidos, que maneja todos los aspectos relacionados con las órdenes de compra, devoluciones, motivos de no compra y recaudos generados por las ventas; y el módulo de mapas, que visualiza gráficamente los recorridos de los vendedores en diversas ciudades de Colombia, proporcionando una representación clara y útil para el análisis logístico."
      ],
      "en": [
        "This project aims to comprehensively improve the operations of companies dedicated to the export of food and raw materials. Key aspects addressed include: order management, user administration on the platform, integrations with external systems, report generation, dashboard creation, route tracking through maps, and various additional operational tools. My role as leader of the frontend development team included managing the project architecture, general organization, user interface development, and integration with the backend. In addition, I carried out specific implementations in essential modules, such as order management, integrations, and administration, contributing significantly to the success of the project.",
        "For this project I implemented Clean Architecture, which allowed for a modular, scalable, and easy-to-maintain structure. I divided the work into three layers: the domain, which contains the core business logic; the infrastructure, which manages communication with the backend through repositories; and the UI, developed in React JS, where the framework is abstracted to ensure component reuse. This organization ensures independence between layers, facilitates future expansions, and maintains the integrity of the project over time.",
        "I developed a fundamental modular integrations module that consists of two key parts: configuration and execution. Configuration allows setting the necessary parameters for integrations through an intuitive graphical user interface. Execution processes and transforms data coming from files such as Excel, CSV or TXT, as well as from databases, to store and organize them in the application database, ensuring an efficient and structured integration.",
        "Other key modules I developed include the administrators module, which manages and configures database information through SQL queries or tables; the order management module, which handles all aspects related to purchase orders, returns, reasons for non-purchase, and collections generated by sales; and the maps module, which graphically displays the routes of sellers in various cities in Colombia, providing a clear and useful representation for logistics analysis."
      ]
    }
  },
  "comp": {
    "year": "2023 - now",
    "tags": [
      "React",
      "Sass",
      "TypeScript",
      "Git"
    ],
    "public": false,
    "link": "https://dynamic-components-storybook.netlify.app/?path=/docs/example-dynamictable--docs",
    "cover": "/assets/work/comp.webp",
    "gallery": [
      "/assets/work/comp-1.webp",
      "/assets/work/comp-2.webp"
    ],
    "source": {
      "cover": "/project-2.webp",
      "gallery": [
        "/project-2-1.webp",
        "/project-2-2.webp"
      ]
    },
    "story": {
      "es": [
        "La librería de componentes dinámicos se desarrolló como una solución para un desafío significativo en el proyecto de fuerza de ventas: la repetición de código en múltiples partes del sistema. Con el fin de optimizar el desarrollo y mantener la consistencia, decidimos crear una librería que facilitara la reutilización del código y la generación de componentes de forma dinámica. Para llevar a cabo esta solución, empleamos una combinación de tecnologías avanzadas, incluyendo React para la creación de los componentes, Storybook para su visualización en un entorno de desarrollo, y Rollup para la optimización y empaquetado de los mismos. Esta estrategia no solo permitió una mayor eficiencia en el desarrollo, sino que también mejoró la capacidad de mantenimiento y escalabilidad del proyecto al reducir la redundancia y centralizar la gestión de componentes.",
        "Dentro de la librería de componentes dinámicos, el componente más destacado es el componente de reporte dinámico, que se distingue por ser el más complejo y versátil de toda la colección. Este componente está compuesto por una serie de subcomponentes dinámicos que trabajan en conjunto para ofrecer una presentación flexible y adaptativa de diversos tipos de reportes. Su diseño permite la generación de informes en tiempo real, integrando múltiples formatos de visualización, incluyendo tablas dinámicas, gráficos de variados tipos y mapas interactivos. Gracias a su capacidad para manejar y mostrar datos de manera efectiva, el componente de reporte dinámico no solo facilita la interpretación de la información, sino que también mejora la toma de decisiones al proporcionar una vista integral y personalizada de los datos.",
        "Además del componente de reporte dinámico, la librería incluye otros componentes dinámicos igualmente importantes. El componente de tabla dinámica ofrece una forma ordenada y categorizada de presentar datos, facilitando su análisis y comprensión. El componente de mapa dinámico permite visualizar los datos en un mapa interactivo, proporcionando una perspectiva geoespacial de la información. Por último, el componente de filtros dinámicos ofrece la flexibilidad de aplicar diferentes configuraciones para personalizar los filtros que se desean aplicar a los datos, optimizando así la visualización y el análisis de la información según las necesidades específicas del usuario. Estos componentes trabajan en conjunto para proporcionar una experiencia de usuario rica y versátil, adaptándose a diversas formas de presentación de datos."
      ],
      "en": [
        "The Dynamic Components Library was developed as a solution to a significant challenge in the sales force project: code repetition in multiple parts of the system. In order to streamline development and maintain consistency, we decided to create a library that would facilitate code reuse and dynamic component generation. To implement this solution, we employed a combination of advanced technologies, including React for component creation, Storybook for display in a development environment, and Rollup for component optimization and packaging. This strategy not only enabled increased development efficiency, but also improved the maintainability and scalability of the project by reducing redundancy and centralizing component management.",
        "Within the dynamic component library, the most notable component is the dynamic report component, which stands out for being the most complex and versatile of the entire collection. This component is composed of a series of dynamic subcomponents that work together to offer a flexible and adaptive presentation of various types of reports. Its design allows the generation of reports in real time, integrating multiple display formats, including dynamic tables, graphs of various types and interactive maps. Thanks to its ability to effectively manage and display data, the dynamic report component not only facilitates the interpretation of information, but also improves decision making by providing a comprehensive and personalized view of the data.",
        "In addition to the dynamic report component, the library includes other equally important dynamic components. The dynamic table component offers an orderly and categorized way of presenting data, facilitating its analysis and understanding. The dynamic map component allows the data to be visualized on an interactive map, providing a geospatial perspective of the information. Finally, the dynamic filters component offers the flexibility to apply different configurations to customize the filters to be applied to the data, thus optimizing the visualization and analysis of the information according to the specific needs of the user. These components work together to provide a rich and versatile user experience, adapting to various forms of data presentation."
      ]
    }
  },
  "apolo": {
    "year": "2024",
    "tags": [
      "React",
      "Tailwindcss",
      "TypeScript",
      "Git"
    ],
    "public": true,
    "link": "https://www.npmjs.com/package/@tingenio/apolo-ui",
    "cover": "/assets/work/apolo.webp",
    "gallery": [
      "/assets/work/apolo-1.webp"
    ],
    "source": {
      "cover": "/project-3.webp",
      "gallery": [
        "/project-3-1.webp"
      ]
    },
    "story": {
      "es": [
        "Este proyecto consiste en una librería de componentes UI diseñada para la creación de interfaces de usuario en React JS. La iniciativa surgió para satisfacer la necesidad de un sistema de diseño coherente que pudiera gestionar de manera eficaz diversos proyectos tanto en términos visuales como funcionales. Apolo UI se construyó utilizando tecnologías avanzadas como React JS, Storybook y Rollup, lo que garantiza una integración fluida y una experiencia de desarrollo robusta. Trabajé en esta librería en colaboración con un equipo de desarrolladores, y la misma incluye una amplia gama de componentes esenciales para el diseño de interfaces, tales como inputs, botones, modales, alertas y más. Este enfoque modular y adaptable permite a los desarrolladores implementar rápidamente interfaces consistentes y de alta calidad en sus proyectos.",
        "Entre los componentes más destacados que desarrollé en esta librería se encuentra una galería de imágenes con una funcionalidad de subida de archivos interactiva. Este componente no solo es estéticamente atractivo, sino que también se adapta de manera fluida a cualquier resolución, garantizando una experiencia visual consistente en diversos dispositivos. Además, incluí un sofisticado componente de dropdown, que presenta un menú desplegable con animaciones suaves, diseñadas utilizando Framer Motion. Este componente ofrece múltiples opciones de personalización, permitiendo a los desarrolladores ajustar su apariencia y comportamiento según las necesidades específicas del proyecto. Ambos componentes demuestran la capacidad de la librería para combinar funcionalidad avanzada con un diseño elegante y adaptable."
      ],
      "en": [
        "This project consists of a UI component library designed for building user interfaces in React JS. The initiative arose to meet the need for a coherent design system that could effectively manage diverse projects both visually and functionally. Apolo UI was built using advanced technologies such as React JS, Storybook, and Rollup, ensuring seamless integration and a robust development experience. I worked on this library in collaboration with a team of developers, and it includes a wide range of essential UI components such as inputs, buttons, modals, alerts, and more. This modular and adaptable approach allows developers to quickly implement consistent, high-quality interfaces in their projects.",
        "Among the most notable components I developed in this library is an image gallery with interactive file upload functionality. This component is not only aesthetically pleasing, but also fluidly adapts to any resolution, ensuring a consistent visual experience across multiple devices. Additionally, I included a sophisticated dropdown component, which features a drop-down menu with smooth animations, designed using Framer Motion. This component offers multiple customization options, allowing developers to fine-tune its appearance and behavior to the specific needs of the project. Both components demonstrate the library’s ability to combine advanced functionality with an elegant, responsive design."
      ]
    }
  },
  "ased": {
    "year": "2024",
    "tags": [
      "Nextjs",
      "Nodejs",
      "Tailwindcss",
      "TypeScript",
      "Git"
    ],
    "public": false,
    "link": null,
    "cover": "/assets/work/ased.webp",
    "gallery": [
      "/assets/work/ased-1.webp",
      "/assets/work/ased-2.webp"
    ],
    "source": {
      "cover": "/project-4.webp",
      "gallery": [
        "/project-4-1.webp",
        "/project-4-2.webp"
      ]
    },
    "story": {
      "es": [
        "Este proyecto surgió de la necesidad de una empresa por implementar una solución de software que optimizara todo su proceso de adquisición de clientes y mejorara la gestión de solicitudes. El desarrollo se estructuró en dos partes principales: una landing page enfocada en la captación de clientes y una plataforma interna para la administración de todo su contenido. Esta plataforma permite gestionar de manera eficiente los textos, usuarios, categorías, socios comerciales (partners) y otros elementos clave. Además, para mejorar la interacción con los clientes, se implementó un chat en tiempo real que facilita la comunicación directa. El proyecto fue desarrollado utilizando tecnologías modernas, entre las que destacan ReactJS para la interfaz de usuario, NodeJS para el backend, Socket.io para la funcionalidad de chat en tiempo real y Apolo UI para los componentes de interfaz personalizados, garantizando una solución robusta y escalable.",
        "Uno de los aspectos más destacados que desarrollé fue la administración dinámica del contenido del sitio web, permitiendo a los usuarios cargar y actualizar información como textos, imágenes y videos de manera eficiente. Esto se logró a través de una interfaz intuitiva y fácil de usar, organizada en secciones que simplifican la gestión del contenido sin requerir conocimientos técnicos avanzados.",
        "Implementé un sistema flexible de gestión de categorías y subcategorías para organizar de manera clara y precisa las soluciones ofrecidas por la empresa. Este sistema optimizó la experiencia del usuario final, facilitando una navegación más estructurada y accesible. Además, permitió a la compañía gestionar su contenido de forma autónoma, brindándole control total sobre las actualizaciones de servicios y productos sin depender del equipo de desarrollo para ajustes menores. Esta solución no solo mejoró la eficiencia operativa, sino que también garantizó un mantenimiento más ágil y sostenible a largo plazo."
      ],
      "en": [
        "This project arose from a company's need to implement a software solution that would optimize its entire customer acquisition process and improve request management. The development was structured in two main parts: a landing page focused on customer acquisition and an internal platform for managing all of its content. This platform allows for efficient management of texts, users, categories, business partners, and other key elements. In addition, to improve interaction with customers, a real-time chat was implemented that facilitates direct communication. The project was developed using modern technologies, including ReactJS for the user interface, NodeJS for the backend, Socket.io for the real-time chat functionality, and Apolo UI for custom interface components, ensuring a robust and scalable solution.",
        "One of the highlights I developed was dynamic management of website content, allowing users to upload and update information such as text, images and videos efficiently. This was achieved through an intuitive and user-friendly interface, organized into sections that simplify content management without requiring advanced technical knowledge.",
        "I implemented a flexible category and subcategory management system to clearly and accurately organize the solutions offered by the company. This system optimized the end-user experience, facilitating a more structured and accessible navigation. In addition, it allowed the company to manage its content autonomously, giving it full control over service and product updates without relying on the development team for minor adjustments. This solution not only improved operational efficiency, but also guaranteed more agile and sustainable maintenance in the long term."
      ]
    }
  },
  "tramites": {
    "year": "2023 - 2024",
    "tags": [
      "Vue",
      "JavaScript",
      "Nodejs",
      "MongoDB",
      "Sass",
      "Git"
    ],
    "public": false,
    "link": null,
    "cover": "/assets/work/tramites.webp",
    "gallery": [
      "/assets/work/tramites-1.webp",
      "/assets/work/tramites-2.webp",
      "/assets/work/tramites-3.webp"
    ],
    "source": {
      "cover": "/project-5.webp",
      "gallery": [
        "/project-5-1.webp",
        "/project-5-2.webp",
        "/project-5-3.webp"
      ]
    },
    "story": {
      "es": [
        "Un proyecto colaborativo con el gobierno de Ecuador para desarrollar una plataforma que centralizara la gestión de todos los trámites del país, desde la solicitud de pasaportes hasta la inscripción de vehículos. El objetivo principal de esta plataforma fue agilizar los procesos y reducir la corrupción al ofrecer un sistema más transparente y eficiente. Utilizamos Vue JS para el frontend, proporcionando una interfaz moderna y fácil de usar, mientras que en el backend empleamos Node JS para garantizar un rendimiento óptimo. Para el almacenamiento de datos, se implementó una base de datos no relacional, que permitió una gestión flexible y escalable de la información. Este proyecto marcó un avance significativo en la digitalización de los servicios públicos en Ecuador.",
        "En este proyecto, desempeñé el rol de líder de desarrollo frontend, supervisando a un equipo de dos desarrolladores. Mis responsabilidades incluyeron la definición de la arquitectura de la aplicación, la creación de los componentes principales y la integración con el backend. Además, realicé pruebas unitarias para asegurar el correcto funcionamiento de los componentes y fui responsable de la documentación completa de la aplicación. También me encargué de las pruebas de integración, garantizando que todos los elementos del sistema trabajaran en conjunto de manera eficiente y sin errores. Mi enfoque estuvo siempre en asegurar la calidad del código y la estabilidad del proyecto.",
        "Desarrollé el flujo completo para la realización de trámites, estructurado en varios pasos para optimizar la experiencia del usuario. El proceso comienza con el ingreso de información personal, seguido por una sección donde se pueden adjuntar los documentos requeridos. Luego, el usuario selecciona la notaría más conveniente para completar el trámite, y finalmente, se gestiona el pago de los costos asociados. Este diseño facilita que los usuarios realicen sus trámites de forma más rápida y sencilla, eliminando complicaciones y agilizando todo el proceso de principio a fin.",
        "Además, desarrollé el panel de administración de la aplicación, que permitía llevar un control completo de los trámites gestionados en la plataforma. Este módulo administrativo daba la posibilidad de crear nuevos trámites, modificar los existentes y supervisar cada uno de los procesos. También incluí un sistema para gestionar y monitorear a los usuarios registrados, así como los trámites que habían realizado. Este desarrollo fue clave para proporcionar una visión integral de las actividades en la plataforma, facilitando el seguimiento eficiente tanto de los trámites como de los usuarios, y optimizando el control de la aplicación."
      ],
      "en": [
        "A collaborative project with the government of Ecuador to develop a platform that would centralize the management of all the country's procedures, from passport applications to vehicle registration. The main objective of this platform was to streamline processes and reduce corruption by offering a more transparent and efficient system. We used Vue JS for the frontend, providing a modern and easy-to-use interface, while in the backend we used Node JS to ensure optimal performance. For data storage, a non-relational database was implemented, allowing for flexible and scalable management of information. This project marked a significant advance in the digitalization of public services in Ecuador.",
        "In this project, I played the role of frontend development lead, supervising a team of two developers. My responsibilities included defining the application architecture, creating the core components, and integrating with the backend. In addition, I performed unit tests to ensure the correct functioning of the components and was responsible for the complete documentation of the application. I also took care of integration testing, ensuring that all elements of the system worked together efficiently and without errors. My focus was always on ensuring the quality of the code and the stability of the project.",
        "I developed the complete flow for completing the procedures, structured in several steps to optimize the user experience. The process begins with entering personal information, followed by a section where the required documents can be attached. Then, the user selects the most convenient notary to complete the procedure, and finally, the payment of the associated costs is managed. This design makes it easier for users to complete their procedures more quickly and easily, eliminating complications and streamlining the entire process from start to finish.",
        "I also developed the application's administration panel, which allowed for complete control of the procedures managed on the platform. This administrative module gave the possibility of creating new procedures, modifying existing ones and supervising each of the processes. I also included a system to manage and monitor registered users, as well as the procedures they had carried out. This development was key to providing a comprehensive view of the activities on the platform, facilitating efficient monitoring of both procedures and users, and optimizing control of the application."
      ]
    }
  },
  "blog": {
    "year": "2023",
    "tags": [
      "Php",
      "Laravel",
      "MongoDB",
      "Git"
    ],
    "public": true,
    "link": "https://github.com/JoanRojasMejia/backend-blog",
    "cover": "/assets/work/blog.webp",
    "gallery": [
      "/assets/work/blog-1.webp"
    ],
    "source": {
      "cover": "/project-6.webp",
      "gallery": [
        "/project-6-1.webp"
      ]
    },
    "story": {
      "es": [
        "Este proyecto personal fue creado con el objetivo de mejorar mi comprensión y práctica en Laravel, uno de los frameworks más populares para el desarrollo backend. La aplicación consiste en una API Restful para un blog dinámico, diseñada para ofrecer funcionalidades clave como la categorización de publicaciones, un sistema de comentarios y likes, y la gestión de usuarios. Implementé autenticación JWT para garantizar un acceso seguro y privado a las funciones del blog. La base de datos MongoDB se encuentra en la nube a través de MongoDB Atlas, proporcionando almacenamiento escalable y eficiente. Además, el proyecto está desplegado en fly.io, una plataforma que facilita la gestión y escalabilidad de aplicaciones en la nube. Este proyecto no solo me permitió profundizar en Laravel y otras tecnologías modernas, sino que también me brindó una experiencia práctica en el desarrollo y despliegue de un backend completo y robusto.",
        "En esta aplicación, implementé un robusto middleware de autenticación JWT que asegura la integridad y seguridad de todas las APIs. Este middleware verifica que el token incluido en la cabecera de la petición sea válido; en caso contrario, la solicitud es rechazada para proteger los datos y funcionalidades de la aplicación. La API incluye una variedad de operaciones CRUD (crear, leer, actualizar y eliminar) para posts, categorías, comentarios y usuarios, facilitando una gestión completa y flexible del contenido. Además, incorporé una funcionalidad de likes para los posts, permitiendo a los usuarios interactuar y valorar el contenido. También se habilitó la opción de subir imágenes en los posts, enriqueciendo la experiencia del usuario y ofreciendo una presentación más visualmente atractiva del contenido. Este enfoque integral no solo proporciona una plataforma dinámica y segura, sino que también mejora significativamente la interacción y el manejo del contenido en el blog."
      ],
      "en": [
        "This personal project was created with the aim of improving my understanding and practice in Laravel, one of the most popular frameworks for backend development. The application consists of a Restful API for a dynamic blog, designed to offer key functionalities such as post categorization, a comment and like system, and user management. I implemented JWT authentication to ensure secure and private access to the blog's features. The MongoDB database is located in the cloud via MongoDB Atlas, providing scalable and efficient storage. Additionally, the project is deployed on fly.io, a platform that facilitates the management and scalability of applications in the cloud. This project not only allowed me to delve deeper into Laravel and other modern technologies, but also gave me practical experience in developing and deploying a complete and robust backend.",
        "In this application, I implemented a robust JWT authentication middleware that ensures the integrity and security of all APIs. This middleware verifies that the token included in the request header is valid; otherwise, the request is rejected to protect the application's data and functionality. The API includes a variety of CRUD (create, read, update, and delete) operations for posts, categories, comments, and users, facilitating complete and flexible content management. In addition, I incorporated a like functionality for posts, allowing users to interact and rate the content. I also enabled the option to upload images to posts, enriching the user experience and offering a more visually appealing presentation of the content. This comprehensive approach not only provides a dynamic and secure platform, but also significantly improves interaction and content management on the blog."
      ]
    }
  }
};

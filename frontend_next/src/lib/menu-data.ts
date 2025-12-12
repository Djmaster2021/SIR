// Datos centralizados del menú para reutilizar en la home y en /menu
export type MenuItem = {
  nombre: string;
  detalle: string;
  precio?: string;
  tag?: string;
  imagen?: string;
  sabores?: string[];
};

export const destacados = [
  {
    titulo: 'Guacamole "El Patrón"',
    descripcion: "Molcajete al momento con chicharrón de Ribeye y totopos de maíz azul.",
    precio: "$260",
    imagen: "/images/guacamole-patron.png",
  },
  {
    titulo: "Enchiladas de Mole Poblano",
    descripcion: "Pollo orgánico, mole artesanal y ajonjolí tostado.",
    precio: "$320",
    imagen: "/images/enchiladas-mole.png",
  },
  {
    titulo: "Arrachera Angus",
    descripcion: "350g al carbón, nopal, chiles toreados y cebollitas.",
    precio: "$550",
    imagen: "/images/arrachera-angus.png",
  },
  {
    titulo: "Cantarito de Lujo",
    descripcion: "Tequila, cítricos y sal de gusano en jarrito de barro.",
    precio: "$190",
    imagen: "/images/cantarito-lujo.png",
  },
];

export const especialesSemana = [
  { titulo: "Lunes de Sopes", detalle: "3 sopes + agua fresca", precio: "$95" },
  { titulo: "Miércoles de Enchiladas", detalle: "Orden + margarita", precio: "$135" },
  { titulo: "Domingo Brunch", detalle: "Chilaquiles + mimosa", precio: "$149" },
];

export const entradas: MenuItem[] = [
  {
    nombre: 'Guacamole "El Patrón"',
    detalle: "Aguacate en molcajete, chicharrón de Ribeye y totopos de maíz azul.",
    precio: "$260",
    imagen: "/images/guacamole-patron.png",
  },
  {
    nombre: "Tuétanos a la Parrilla (3 pzas)",
    detalle: "Huesos al carbón con esquites y epazote, tortillas hechas a mano.",
    precio: "$380",
    imagen: "/images/tuetanos-parrilla.png",
  },
  {
    nombre: "Queso Fundido Real",
    detalle: "Manchego + Oaxaca en cazuela; chistorra, champiñones o rajas.",
    precio: "$210",
    imagen: "/images/queso-fundido.png",
  },
  {
    nombre: "Sopes de Camarón al Ajillo",
    detalle: "Trío de sopes con frijol negro y camarón pacotilla.",
    precio: "$190",
    imagen: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80",
  },
];

export const sopas: MenuItem[] = [
  {
    nombre: "Sopa de Tortilla Azteca",
    detalle: "Caldo de jitomate rostizado, julianas fritas, aguacate y queso panela.",
    precio: "$160",
    imagen: "/images/sopa-tortilla.png",
  },
  {
    nombre: "Ensalada César Original",
    detalle: "Lechuga orejona, aderezo artesanal, crotones y parmesano reggiano.",
    precio: "$220",
    imagen: "/images/ensalada-cesar.png",
  },
];

export const fuertes: MenuItem[] = [
  {
    nombre: "Chamorro de Cerdo Adobado",
    detalle: "Cocción lenta 8h, acompañado de arroz a la mexicana.",
    precio: "$480",
    imagen: "/images/chamorro-adobado.png",
  },
  {
    nombre: "Arrachera Angus Importada (350g)",
    detalle: "Marinada al carbón con nopal, chiles toreados y cebollitas.",
    precio: "$550",
    imagen: "/images/arrachera-angus.png",
  },
  {
    nombre: "Enchiladas de Mole Poblano",
    detalle: "Pollo orgánico, mole artesanal y ajonjolí tostado.",
    precio: "$320",
    imagen: "/images/enchiladas-mole.png",
  },
  {
    nombre: 'Molcajete Mixto "Volcán" (2 pax)',
    detalle: "Piedra caliente con salsa verde, res, pollo, chorizo, nopal y queso panela.",
    precio: "$850",
    imagen: "/images/molcajete-volcan.png",
  },
];

export const postres: MenuItem[] = [
  {
    nombre: "Flan Napolitano de la Abuela",
    detalle: "Caramelo quemado y frutos rojos.",
    precio: "$140",
    imagen: "/images/flan-napolitano.png",
  },
  {
    nombre: "Churros de Feria",
    detalle: "Recién hechos, con cajeta y chocolate.",
    precio: "$180",
    imagen: "/images/churros-feria.png",
  },
  {
    nombre: "Nieves Artesanales",
    detalle: "Sabores de temporada: mamey, cajeta y mezcal con cítricos.",
    precio: "$95",
    imagen: "/images/nieves.png",
  },
];

export const bebidasSin: MenuItem[] = [
  {
    nombre: "Aguas Frescas Gourmet (Jarra)",
    detalle: "Horchata con nuez, Jamaica con romero, Limón con chía. Jarra 1L.",
    precio: "$85 (1L)",
    sabores: ["Horchata", "Jamaica", "Limón con chía"],
  },
  {
    nombre: "Refrescos de Vidrio",
    detalle: "355 ml bien fríos. Perfectos con hielos y rodaja de limón.",
    precio: "$60 (355 ml)",
    sabores: [
      "Coca-Cola Original",
      "Coca-Cola Sin Azúcar",
      "Sidral",
      "Jarritos Tamarindo",
      "Jarritos Mandarina",
      "Jarritos Piña",
    ],
  },
];

export const cocteles: MenuItem[] = [
  {
    nombre: "Cantarito de Lujo",
    detalle: "Tequila, jugos cítricos, sal de gusano en jarrito de barro. Vaso 400 ml aprox.",
    precio: "$190 (400 ml)",
    sabores: ["Naranja", "Toronja", "Limón"],
  },
  {
    nombre: "Mezcalita de Sabores",
    detalle: "Mezcal espadín joven con fruta fresca y escarchado de chile. Vaso 350 ml aprox.",
    precio: "$200 (350 ml)",
    sabores: ["Maracuyá", "Tamarindo", "Jamaica"],
  },
  {
    nombre: "Paloma Tradicional",
    detalle: "Tequila reposado, Squirt, limón y sal de grano. Vaso 400 ml aprox.",
    precio: "$180 (400 ml)",
    sabores: ["Clásica", "Con chile", "Light"],
  },
];

export const cervezas: MenuItem[] = [
  {
    nombre: "Nacionales",
    detalle: "355 ml bien frías. Corona, Victoria, Modelo Especial, Negra Modelo.",
    precio: "$70 (355 ml)",
    sabores: ["Corona", "Victoria", "Modelo Especial", "Negra Modelo"],
  },
  {
    nombre: "Michelada / Ojo Rojo",
    detalle: "1 litro con salsas negras, limón, clamato y escarchado con sal de mar.",
    precio: "$130 (1L)",
    sabores: ["Clásica", "Cubana", "Ojo Rojo"],
  },
];

export const vipBotellas: MenuItem[] = [
  { nombre: "Don Julio 70 (Cristalino)", precio: "$2,800", detalle: "Incluye 5 mezcladores." },
  { nombre: "Maestro Dobel Diamante", precio: "$2,400", detalle: "Incluye 5 mezcladores." },
  { nombre: "Herradura Reposado", precio: "$2,100", detalle: "Incluye 5 mezcladores." },
  { nombre: "Reserva de la Familia (Extra Añejo)", precio: "$4,500", detalle: "Incluye 5 mezcladores." },
  { nombre: "Clase Azul Reposado", precio: "$7,500", detalle: "Incluye 5 mezcladores." },
  { nombre: "400 Conejos Joven", precio: "$1,900", detalle: "Mezcal." },
  { nombre: "Montelobos Espadín", precio: "$2,200", detalle: "Mezcal." },
  { nombre: "Ojo de Tigre", precio: "$2,100", detalle: "Mezcal." },
  { nombre: "Buchanan’s 12 Años", precio: "$2,300", detalle: "Whisky." },
  { nombre: "Buchanan’s 18 Años", precio: "$3,900", detalle: "Whisky." },
  { nombre: "Johnnie Walker Black Label", precio: "$2,200", detalle: "Whisky." },
  { nombre: "Moët & Chandon", precio: "$3,500", detalle: "Champagne." },
];

export const entretenimiento: MenuItem[] = [
  {
    nombre: "Viernes – Acústico & Pop",
    detalle: "Solistas o dúos con guitarra, 9:00 pm - 11:30 pm. Ambiente para cena y charla. Cover general: $0.",
    precio: "Cover: $0",
  },
  {
    nombre: "Sábado – Norteño/Banda Light",
    detalle: "Grupos locales (3-4). Regional ligero para cantar. Horario 9:30 pm - 1:00 am. Área general sin cover.",
    precio: "Cover: $0",
  },
  {
    nombre: "Domingo – Voces y Baladas",
    detalle: "Clásicos de Juan Gabriel, José José, Luis Miguel. Ambiente familiar 7:00 pm - 10:00 pm.",
    precio: "Cover: $0",
  },
];

export const promos: MenuItem[] = [
  {
    nombre: "Cumpleañero VIP",
    detalle: "Zona VIP + compra de 2 botellas = vino espumoso de regalo, bengalas y mañanitas.",
    precio: "Desde $4,200 (2 botellas nacionales)",
  },
  {
    nombre: "Jueves de Pre-copa",
    detalle: "20% de descuento en botellas Tradicional, Etiqueta Roja, Smirnoff antes de las 10:00 pm.",
    precio: "Ej: Tradicional ~$1,120 con descuento",
  },
  {
    nombre: "Paquete Ejecutivo (Vie 2pm-6pm)",
    detalle: "1 botella nacional + 1kg carnitas/ arrachera al centro + guarniciones.",
    precio: "$2,500",
  },
];

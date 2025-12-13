export type FullMenuSection = {
  titulo: string;
  descripcion?: string;
  items: {
    nombre: string;
    detalle: string;
    precio?: string;
    imagen?: string;
  }[];
};

export const fullMenu: FullMenuSection[] = [
  {
    titulo: "Entradas Signature",
    descripcion: "Para compartir al centro y abrir el apetito.",
    items: [
      {
        nombre: 'Guacamole Imperial "El Mirador"',
        detalle: "Aguacate hass en molcajete, aceite de oliva extra virgen y totopos de maíz azul.",
        precio: "$260",
        imagen: "/images/guacamole-patron.png",
      },
      {
        nombre: "Tuétanos Asados al Carbón (3 pzas)",
        detalle: "Al carbón, con esquites gourmet y tortillas artesanales.",
        precio: "$380",
        imagen: "/images/tuetanos-parrilla.png",
      },
      {
        nombre: "Tostada de Atún Aleta Amarilla",
        detalle: "Atún sellado, aguacate y emulsión de chile serrano.",
        precio: "$310",
      },
      {
        nombre: "Queso Fundido Trufado",
        detalle: "Quesos mexicanos selectos, hongos silvestres y aceite de trufa.",
        precio: "$290",
        imagen: "/images/queso-fundido.png",
      },
      {
        nombre: "Sopes de Camarón al Ajillo (3 pzas)",
        detalle: "Camarón pacotilla, frijol negro y mantequilla especiada.",
        precio: "$320",
      },
      {
        nombre: "Esquites de Elote Rostizado",
        detalle: "Elote blanco, queso añejo y mayonesa artesanal.",
        precio: "$240",
      },
      {
        nombre: "Carpaccio de Res con Chile Pasilla",
        detalle: "Laminado fino, aceite de oliva y sal de mar.",
        precio: "$360",
      },
      {
        nombre: "Empanadas de Pato Confitado (2 pzas)",
        detalle: "Relleno delicado con mole suave.",
        precio: "$340",
      },
      {
        nombre: "Chicharrón Prensado Crujiente",
        detalle: "Sobre guacamole rústico.",
        precio: "$280",
      },
      {
        nombre: "Mini Tlayuda Gourmet",
        detalle: "Asiento tradicional, quesillo ahumado y salsa tatemada.",
        precio: "$260",
      },
    ],
  },
  {
    titulo: "Sopas & Ensaladas",
    items: [
      {
        nombre: "Sopa de Tortilla Azteca",
        detalle: "Caldo de jitomate rostizado, aguacate y queso panela.",
        precio: "$190",
        imagen: "/images/sopa-tortilla.png",
      },
      {
        nombre: "Crema de Chile Poblano Asado",
        detalle: "Sedosa, aromática y elegante.",
        precio: "$210",
      },
      {
        nombre: "Caldo Tlalpeño Premium",
        detalle: "Pollo orgánico, garbanzo y chipotle.",
        precio: "$240",
      },
      {
        nombre: "Sopa de Frijol Negro Oaxaqueño",
        detalle: "Con crema fresca y totopos artesanales.",
        precio: "$200",
      },
      {
        nombre: "Ensalada César Artesanal",
        detalle: "Parmesano reggiano y aderezo clásico.",
        precio: "$260",
        imagen: "/images/ensalada-cesar.png",
      },
      {
        nombre: "Ensalada de Nopal Asado y Queso de Cabra",
        detalle: "Vinagreta ligera de limón amarillo.",
        precio: "$270",
      },
    ],
  },
  {
    titulo: "Pastas mexicanas de autor",
    items: [
      {
        nombre: "Fettuccine en Crema de Chile Poblano",
        detalle: "Pollo orgánico y elote tierno.",
        precio: "$340",
      },
      {
        nombre: "Pasta al Mole Poblano Artesanal",
        detalle: "Mole profundo, parmesano y ajonjolí.",
        precio: "$360",
      },
      {
        nombre: "Tagliatelle de Maíz Azul con Camarón",
        detalle: "Mantequilla, ajo y chile guajillo.",
        precio: "$390",
      },
      {
        nombre: "Ravioles de Queso Oaxaqueño",
        detalle: "Salsa ligera de jitomate rostizado.",
        precio: "$350",
      },
      {
        nombre: "Espagueti en Salsa de Chile Pasilla y Res",
        detalle: "Filete sellado y aroma ahumado.",
        precio: "$420",
      },
      {
        nombre: "Penne al Chipotle Cremoso",
        detalle: "Tocino artesanal y cebollín.",
        precio: "$330",
      },
    ],
  },
  {
    titulo: "Platos fuertes estrella",
    items: [
      {
        nombre: "Ribeye Prime al Carbón (450 g)",
        detalle: "Corte jugoso, sellado a la perfección.",
        precio: "$850",
      },
      {
        nombre: "Arrachera Angus Importada (350 g)",
        detalle: "Marinada tradicional, nopal y cebollitas.",
        precio: "$550",
        imagen: "/images/arrachera-angus.png",
      },
      {
        nombre: "Chamorro de Cerdo Adobado (8 h)",
        detalle: "Cocción lenta, arroz a la mexicana.",
        precio: "$480",
        imagen: "/images/chamorro-adobado.png",
      },
      {
        nombre: "Filete de Res en Salsa de Vino Tinto y Chile Ancho",
        detalle: "Elegante y profundo.",
        precio: "$620",
      },
      {
        nombre: "Mole Poblano Tradicional con Pollo Orgánico",
        detalle: "Receta clásica, sabor envolvente.",
        precio: "$420",
      },
      {
        nombre: "Pescado Zarandeado Premium",
        detalle: "Marinado cítrico y carbón.",
        precio: "$520",
      },
      {
        nombre: "Carnitas Artesanales Estilo Michoacán",
        detalle: "Jugosas y doradas.",
        precio: "$460",
      },
      {
        nombre: 'Molcajete Mixto "Volcán" (2 pax)',
        detalle: "Res, pollo, chorizo, nopal y queso.",
        precio: "$890",
        imagen: "/images/molcajete-volcan.png",
      },
    ],
  },
  {
    titulo: "Bebidas sin alcohol",
    items: [
      { nombre: "Agua de Jamaica Artesanal", detalle: "Infusión natural y refrescante.", precio: "$90" },
      { nombre: "Agua de Horchata Tradicional", detalle: "Cremosa y aromática.", precio: "$95" },
      { nombre: "Agua de Tamarindo Natural", detalle: "Notas dulces y ácidas.", precio: "$95" },
      { nombre: "Limonada Mineral", detalle: "Ligera y efervescente.", precio: "$110" },
      { nombre: "Naranjada Natural", detalle: "Equilibrada y cítrica.", precio: "$120" },
      { nombre: "Coca-Cola Original", detalle: "Clásica, bien fría.", precio: "$95" },
      { nombre: "Coca-Cola Sin Azúcar", detalle: "Versión ligera.", precio: "$95" },
      { nombre: "Sprite", detalle: "Refrescante y cítrica.", precio: "$95" },
      { nombre: "Fanta Naranja", detalle: "Burbujeante y vibrante.", precio: "$95" },
      { nombre: "Agua Mineral Premium", detalle: "Pura y elegante.", precio: "$95" },
    ],
  },
  {
    titulo: "Bebidas con alcohol",
    items: [
      { nombre: "Cerveza Artesanal Nacional", detalle: "Selección mexicana.", precio: "$130" },
      { nombre: "Cerveza Premium Importada", detalle: "", precio: "$150" },
      { nombre: "Copa de Vino Tinto / Blanco / Rosado", detalle: "", precio: "$180" },
      { nombre: "Michelada Clásica", detalle: "", precio: "$160" },
      { nombre: "Clamato Preparado", detalle: "", precio: "$170" },
      { nombre: "Tequila Blanco Premium", detalle: "", precio: "$160" },
      { nombre: "Mezcal Artesanal Espadín", detalle: "", precio: "$180" },
      { nombre: "Aperol Spritz", detalle: "", precio: "$220" },
    ],
  },
  {
    titulo: "Mixología de autor",
    descripcion: "Cocteles creados en casa con destilados premium.",
    items: [
      { nombre: "Mirador Signature", detalle: "Mezcal, piña asada, limón y sal ahumada.", precio: "$260" },
      { nombre: "Ocaso Dorado", detalle: "Tequila reposado y miel de agave.", precio: "$250" },
      { nombre: "Brisa de Altura", detalle: "Ginebra, pepino y tónica premium.", precio: "$240" },
      { nombre: "Volcán Rojo", detalle: "Mezcal, frutos rojos y chile seco.", precio: "$270" },
      { nombre: "Cielo Nocturno", detalle: "Ron añejo, café mexicano y cacao.", precio: "$260" },
      { nombre: "Vista Serena", detalle: "Vodka premium y flor de azahar.", precio: "$245" },
    ],
  },
];

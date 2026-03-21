const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Atlas';
pptx.subject = 'Itinerario Perú 5-15 agosto';
pptx.title = 'Viaje Familiar a Perú (5-15 agosto)';
pptx.company = 'OpenClaw';
pptx.lang = 'es-ES';

const colors = {
  bg: 'F7FAFC',
  navy: '0F172A',
  blue: '1D4ED8',
  green: '065F46',
  gray: '334155',
  light: 'E2E8F0',
  warn: '92400E'
};

function addHeader(slide, title, subtitle='') {
  slide.background = { color: colors.bg };
  slide.addText(title, { x: 0.5, y: 0.3, w: 12.3, h: 0.5, fontSize: 28, bold: true, color: colors.navy });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.5, y: 0.82, w: 12.3, h: 0.4, fontSize: 14, color: colors.gray });
  }
  slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.15, w: 12.3, h: 0, line: { color: colors.light, pt: 1.2 } });
}

// 1. Cover
let s = pptx.addSlide();
addHeader(s, 'Perú en Familia · 5 al 15 de agosto', 'Ruta sugerida: Lima → Cusco → Valle Sagrado → Machu Picchu → Lima');
s.addText('Diseñado para viaje con niña de 9 años (ritmo moderado, descansos y actividades family-friendly).', {
  x: 0.7, y: 1.5, w: 11.8, h: 0.8, fontSize: 18, color: colors.blue, bold: true
});
s.addText('⚠️ Precios y horarios son estimados de mercado (marzo 2026) y deben validarse al reservar.', {
  x: 0.7, y: 2.4, w: 11.8, h: 0.6, fontSize: 14, color: colors.warn
});

// 2. High-level itinerary
s = pptx.addSlide();
addHeader(s, 'Resumen del itinerario (11 días / 10 noches)');
const bullets = [
  'Día 1-2 (5-6 ago): Lima · adaptación + actividades suaves para niña',
  'Día 3 (7 ago): Vuelo Lima → Cusco + tarde ligera (aclimatación)',
  'Día 4-5 (8-9 ago): Valle Sagrado (Pisac / Ollantaytambo / Maras-Moray)',
  'Día 6 (10 ago): Tren a Aguas Calientes + descanso',
  'Día 7 (11 ago): Machu Picchu (entrada temprana, ritmo familiar)',
  'Día 8-9 (12-13 ago): Cusco ciudad + opciones para niños',
  'Día 10 (14 ago): Vuelo Cusco → Lima',
  'Día 11 (15 ago): Vuelo internacional de regreso'
];
s.addText(bullets.map(t => ({ text: t, options: { bullet: { indent: 18 } } })), {
  x: 0.8, y: 1.5, w: 11.8, h: 4.8, fontSize: 20, color: colors.gray
});

// 3. Flights
s = pptx.addSlide();
addHeader(s, 'Vuelos sugeridos (estimados)', 'Base asumida: salida internacional desde Kuala Lumpur (KUL)');
const flightRows = [
  ['Tramo', 'Horario sugerido', 'Duración aprox.', 'Precio estimado'],
  ['KUL → LIM (5 ago)', '09:00 salida / 22:30 llegada', '28-34 h (1-2 escalas)', 'USD 1,350-1,900 adulto'],
  ['LIM → CUZ (7 ago)', '10:00 / 11:25', '1h 25m', 'USD 90-170 adulto'],
  ['CUZ → LIM (14 ago)', '16:30 / 17:55', '1h 25m', 'USD 90-170 adulto'],
  ['LIM → KUL (15 ago)', '11:30 salida', '27-34 h', 'USD 1,350-1,900 adulto']
];
s.addTable(flightRows, {
  x: 0.5, y: 1.45, w: 12.4, h: 3.6,
  border: { type: 'solid', color: 'CBD5E1', pt: 1 },
  fontSize: 12,
  color: colors.gray,
  fill: 'FFFFFF',
  valign: 'middle',
  colW: [2.2, 3.5, 2.0, 3.0],
  rowH: [0.45, 0.55, 0.55, 0.55, 0.55]
});
s.addText('Tip familiar: elegir vuelos domésticos al mediodía para evitar madrugadas y reducir fatiga de la niña.', {
  x: 0.7, y: 5.35, w: 11.8, h: 0.6, fontSize: 14, color: colors.green, bold: true
});

// 4. Day-by-day plan
s = pptx.addSlide();
addHeader(s, 'Agenda día por día (formato familiar)');
const dayPlan = [
  '05 ago · Llegada a Lima, check-in Miraflores, paseo corto al malecón.',
  '06 ago · Parque de las Leyendas + Circuito Mágico del Agua (noche).',
  '07 ago · Vuelo a Cusco, descanso/hidratación, cena temprana.',
  '08 ago · Valle Sagrado (Pisac) + mercado artesanal.',
  '09 ago · Moray/Maras u Ollantaytambo (sin sobrecargar).',
  '10 ago · Tren a Aguas Calientes, tarde libre y descanso.',
  '11 ago · Machu Picchu temprano, regreso tranquilo.',
  '12 ago · Cusco ciudad (Sacsayhuamán + museo/choco workshop).',
  '13 ago · Día buffer (descanso/compras/actividad corta).',
  '14 ago · Vuelo a Lima, última noche cerca del aeropuerto o Miraflores.',
  '15 ago · Regreso internacional.'
];
s.addText(dayPlan.map(t => ({ text: t, options: { bullet: { indent: 16 } } })), {
  x: 0.7, y: 1.45, w: 12, h: 5.4, fontSize: 16, color: colors.gray
});

// 5. Entrances
s = pptx.addSlide();
addHeader(s, 'Entradas y actividades (estimado en USD)');
const ticketRows = [
  ['Actividad', 'Adulto', 'Niña (9 años)', 'Notas'],
  ['Machu Picchu (entrada)', '45-62', '20-35', 'Varía por circuito y disponibilidad'],
  ['Bus Aguas Calientes ↔ Machu Picchu', '24 ida/vuelta', '12 ida/vuelta', 'Compra anticipada recomendada'],
  ['Boleto Turístico Cusco (parcial)', '20-25', '10-15', 'Ideal para 1-2 días'],
  ['Parque de las Leyendas (Lima)', '5-6', '2-3', 'Muy recomendable para familias'],
  ['Circuito Mágico del Agua', '1.5-2', '1.5-2', 'Espectáculo nocturno']
];
s.addTable(ticketRows, {
  x: 0.5, y: 1.45, w: 12.4, h: 3.8,
  border: { type: 'solid', color: 'CBD5E1', pt: 1 },
  fontSize: 11,
  color: colors.gray,
  fill: 'FFFFFF',
  colW: [3.7, 1.7, 1.9, 4.8],
  rowH: [0.45, 0.55, 0.55, 0.55, 0.55, 0.55]
});

// 6. Airbnb suggestions
s = pptx.addSlide();
addHeader(s, 'Airbnb sugeridos (zonas + rango por noche)', 'Criterio: seguridad, walkability, y comodidad para niña');
const airbnbRows = [
  ['Ciudad', 'Zona recomendada', 'Tipo ideal', 'Rango/noche'],
  ['Lima', 'Miraflores / San Isidro', '2 hab., cocina, cerca parques', 'USD 70-130'],
  ['Cusco', 'Centro histórico (zona tranquila)', '2 hab., calefacción, desayuno opcional', 'USD 55-110'],
  ['Valle Sagrado', 'Ollantaytambo / Urubamba', 'Casa/depa familiar', 'USD 60-140'],
  ['Aguas Calientes', 'Centro cercano estación', 'Hotel/Airbnb sencillo 1 noche', 'USD 50-110']
];
s.addTable(airbnbRows, {
  x: 0.5, y: 1.45, w: 12.4, h: 3.5,
  border: { type: 'solid', color: 'CBD5E1', pt: 1 },
  fontSize: 12,
  color: colors.gray,
  fill: 'FFFFFF',
  colW: [1.8, 3.3, 3.9, 2.0],
  rowH: [0.45, 0.55, 0.55, 0.55, 0.55]
});
s.addText('Filtro recomendado Airbnb: “entire place”, review 4.8+, cancelación flexible, y mínimo 2 camas reales.', {
  x: 0.7, y: 5.2, w: 11.8, h: 0.6, fontSize: 13, color: colors.green
});

// 7. Budget
s = pptx.addSlide();
addHeader(s, 'Presupuesto estimado (familia 2 adultos + 1 niña)');
const budgetRows = [
  ['Rubro', 'Rango estimado'],
  ['Vuelos internacionales (3 pax)', 'USD 3,300-4,900'],
  ['Vuelos internos (3 pax total)', 'USD 450-850'],
  ['Alojamiento (10 noches)', 'USD 700-1,300'],
  ['Entradas y actividades', 'USD 250-500'],
  ['Comidas y transporte local', 'USD 700-1,200'],
  ['Total estimado', 'USD 5,400-8,750']
];
s.addTable(budgetRows, {
  x: 0.9, y: 1.6, w: 11.0, h: 3.7,
  border: { type: 'solid', color: 'CBD5E1', pt: 1 },
  fontSize: 16,
  color: colors.gray,
  fill: 'FFFFFF',
  colW: [6.2, 3.8],
  rowH: [0.52,0.52,0.52,0.52,0.52,0.52,0.6]
});
s.addText('Incluye colchón de contingencia por clima/altitud y cambios de último minuto.', {
  x: 1.0, y: 5.5, w: 10.8, h: 0.5, fontSize: 13, color: colors.warn
});

// 8. Child-focused checklist
s = pptx.addSlide();
addHeader(s, 'Checklist para viajar con niña de 9 años');
const check = [
  'Aclimatación: primer día en Cusco muy ligero, hidratación continua.',
  'Botiquín pediátrico + protector solar + capas térmicas por amplitud térmica.',
  'Snacks + entretenimiento para traslados largos (tren y vuelos).',
  'Priorizar alojamiento con lavadora/cocina para flexibilidad familiar.',
  'Siempre plan B bajo techo por lluvia (agosto suele ser seco, pero prever).',
  'Seguro de viaje con cobertura de altura y cancelaciones.'
];
s.addText(check.map(t => ({ text: t, options: { bullet: { indent: 18 } } })), {
  x: 0.9, y: 1.5, w: 11.4, h: 4.8, fontSize: 20, color: colors.gray
});

// 9. Next actions
s = pptx.addSlide();
addHeader(s, 'Siguientes pasos (para cerrar reservas esta semana)');
s.addText([
  { text: '1) Confirmar aeropuerto de salida exacto y presupuesto tope.\n', options: { bullet: { indent: 18 } } },
  { text: '2) Bloquear vuelos KUL↔LIM + LIM↔CUZ.\n', options: { bullet: { indent: 18 } } },
  { text: '3) Comprar entrada Machu Picchu + bus y reservar tren.\n', options: { bullet: { indent: 18 } } },
  { text: '4) Elegir 2-3 Airbnbs por ciudad con cancelación flexible.\n', options: { bullet: { indent: 18 } } },
  { text: '5) Cerrar agenda diaria con bloques: mañana / descanso / tarde.', options: { bullet: { indent: 18 } } }
], {
  x: 0.9, y: 1.6, w: 11.4, h: 4.7, fontSize: 20, color: colors.gray
});

pptx.writeFile({ fileName: '/data/.openclaw/workspace/Peru_Itinerario_5-15_Agosto_Familia.pptx' });

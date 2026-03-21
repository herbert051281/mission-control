const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Atlas · Legolas PM mode';
pptx.subject = 'Itinerario familiar Perú 5-15 agosto desde SAL';
pptx.title = 'Perú Itinerario Orquestado (Familia)';
pptx.company = 'OpenClaw';
pptx.lang = 'es-ES';

const C = {
  bg: 'F8FAFC',
  title: '0F172A',
  text: '334155',
  accent: '1D4ED8',
  ok: '065F46',
  warn: '92400E',
  line: 'CBD5E1'
};

function header(slide, title, subtitle = '') {
  slide.background = { color: C.bg };
  slide.addText(title, { x: 0.5, y: 0.22, w: 12.3, h: 0.55, fontSize: 28, bold: true, color: C.title });
  if (subtitle) slide.addText(subtitle, { x: 0.5, y: 0.78, w: 12.3, h: 0.35, fontSize: 13, color: C.text });
  slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.12, w: 12.3, h: 0, line: { color: C.line, pt: 1.2 } });
}

let s = pptx.addSlide();
header(s, 'Perú en Familia (5–15 agosto) · Salida desde SAL', 'Plan orquestado para 2 adultos + niña de 9 años');
s.addText('Objetivo del plan: maximizar experiencia cultural sin sobrecarga física, cuidando altitud, descansos y logística familiar.', {
  x: 0.7, y: 1.55, w: 11.8, h: 0.7, fontSize: 18, bold: true, color: C.accent
});
s.addText('Supuesto de trabajo: precios/horarios referenciales de mercado (marzo 2026). Confirmar en aerolínea, operador ferroviario y portales oficiales antes de pago.', {
  x: 0.7, y: 2.45, w: 11.8, h: 0.75, fontSize: 14, color: C.warn
});

s = pptx.addSlide();
header(s, 'Secuencia de viaje (11 días / 10 noches)', 'Ritmo moderado con día buffer y bloques de recuperación');
s.addText([
  { text: 'Día 1-2 (5-6 ago): Lima · llegada, adaptación y actividades suaves.\n', options: { bullet: { indent: 16 } } },
  { text: 'Día 3 (7 ago): Vuelo LIM→CUZ y tarde ligera por aclimatación.\n', options: { bullet: { indent: 16 } } },
  { text: 'Día 4-5 (8-9 ago): Valle Sagrado (Pisac/Ollantaytambo + opción Maras/Moray).\n', options: { bullet: { indent: 16 } } },
  { text: 'Día 6 (10 ago): Tren a Aguas Calientes, descanso anticipado.\n', options: { bullet: { indent: 16 } } },
  { text: 'Día 7 (11 ago): Machu Picchu en horario temprano.\n', options: { bullet: { indent: 16 } } },
  { text: 'Día 8-9 (12-13 ago): Cusco ciudad + actividades aptas para niña.\n', options: { bullet: { indent: 16 } } },
  { text: 'Día 10-11 (14-15 ago): CUZ→LIM y regreso internacional LIM→SAL.', options: { bullet: { indent: 16 } } }
], { x: 0.8, y: 1.45, w: 11.9, h: 4.8, fontSize: 19, color: C.text });

s = pptx.addSlide();
header(s, 'Itinerario día por día (detalle operativo)');
const rowsAgenda = [
  ['Fecha', 'Base', 'Plan principal', 'Ajuste familiar (niña 9)'],
  ['05 ago', 'Lima', 'Llegada SAL→LIM, check-in, paseo corto Miraflores', 'Dormir temprano, hidratación'],
  ['06 ago', 'Lima', 'Parque de las Leyendas + Circuito Mágico del Agua', 'Siesta post-almuerzo'],
  ['07 ago', 'Cusco', 'Vuelo LIM→CUZ, tarde libre en hotel', 'Nada de caminatas largas'],
  ['08 ago', 'Valle Sagrado', 'Pisac + mercado artesanal', 'Traslados con snacks y pausas'],
  ['09 ago', 'Valle Sagrado', 'Ollantaytambo o Maras/Moray (elige 1 foco)', 'Evitar agenda doble intensa'],
  ['10 ago', 'Aguas Calientes', 'Tren y tarde ligera', 'Cena temprana + descanso'],
  ['11 ago', 'Cusco', 'Machu Picchu + retorno', 'Ritmo lento, fotos y pausas'],
  ['12 ago', 'Cusco', 'Sacsayhuamán + taller chocolate/museo corto', 'Bloques de 90 min máximo'],
  ['13 ago', 'Cusco', 'Día buffer (compras o descanso)', 'Reprogramación por clima/fatiga'],
  ['14 ago', 'Lima', 'Vuelo CUZ→LIM', 'Hotel cerca aeropuerto si vuelo temprano'],
  ['15 ago', '—', 'Vuelo LIM→SAL', 'Mochila de mano con kit niño']
];
s.addTable(rowsAgenda, {
  x: 0.45, y: 1.32, w: 12.5, h: 5.8,
  border: { type: 'solid', color: C.line, pt: 1 },
  fontSize: 10,
  color: C.text,
  fill: 'FFFFFF',
  colW: [1.1, 1.7, 4.5, 5.2]
});

s = pptx.addSlide();
header(s, 'Vuelos sugeridos y rangos estimados (USD)', 'Supuestos: compra con 8-16 semanas de anticipación, equipaje 1 maleta facturada/familia');
const rowsFlights = [
  ['Tramo', 'Ventana horaria sugerida', 'Duración aprox.', 'Precio estimado por persona'],
  ['SAL→LIM (05 ago)', 'Salida matutina, llegada tarde', '8-12h (1 escala)', 'USD 380-720'],
  ['LIM→CUZ (07 ago)', '10:00-13:00', '1h 20m-1h 35m', 'USD 90-170'],
  ['CUZ→LIM (14 ago)', '14:00-18:00', '1h 20m-1h 35m', 'USD 90-170'],
  ['LIM→SAL (15 ago)', 'Media mañana/tarde', '8-12h (1 escala)', 'USD 380-720']
];
s.addTable(rowsFlights, {
  x: 0.55, y: 1.45, w: 12.3, h: 3.2,
  border: { type: 'solid', color: C.line, pt: 1 },
  fontSize: 12,
  color: C.text,
  fill: 'FFFFFF',
  colW: [2.5, 3.5, 2.3, 3.3]
});
s.addText('Opciones usuales de aerolínea: Avianca/Copa/LATAM para SAL↔LIM; LATAM/Sky/JetSMART para LIM↔CUZ (según temporada).', {
  x: 0.7, y: 5.0, w: 11.8, h: 0.6, fontSize: 12.5, color: C.ok
});

s = pptx.addSlide();
header(s, 'Entradas y costos clave (estimados en USD)');
const rowsTickets = [
  ['Actividad', 'Adulto', 'Niña (9 años)', 'Notas de compra'],
  ['Machu Picchu (entrada)', '45-62', '20-35', 'Reservar circuito y horario con antelación'],
  ['Bus Aguas Calientes↔Machu Picchu', '24 RT', '12 RT', 'Comprar al cerrar fecha exacta'],
  ['Tren Ollanta/A.C. (ida y vuelta)', '120-220', '90-180', 'PeruRail/IncaRail; depende clase'],
  ['Boleto Turístico Cusco (parcial)', '20-25', '10-15', 'Útil para circuito corto en ciudad/ruinas'],
  ['Parque de las Leyendas (Lima)', '5-6', '2-3', 'Actividad ideal día de baja intensidad'],
  ['Circuito Mágico del Agua', '1.5-2', '1.5-2', 'Comprar en taquilla, visita nocturna']
];
s.addTable(rowsTickets, {
  x: 0.45, y: 1.45, w: 12.4, h: 4.1,
  border: { type: 'solid', color: C.line, pt: 1 },
  fontSize: 11,
  color: C.text,
  fill: 'FFFFFF',
  colW: [3.3, 1.3, 1.8, 5.2]
});

s = pptx.addSlide();
header(s, 'Airbnb/hospedaje recomendado (zonas + rango noche)');
const rowsStay = [
  ['Ciudad', 'Zona sugerida', 'Rango por noche', 'Filtro recomendado'],
  ['Lima', 'Miraflores / San Isidro', 'USD 70-130', '4.8+ rating, cocina, cancelación flexible'],
  ['Cusco', 'Centro histórico tranquilo / Wanchaq', 'USD 55-110', 'Calefacción, acceso en taxi, desayuno'],
  ['Valle Sagrado', 'Ollantaytambo / Urubamba', 'USD 60-140', 'Espacio familiar, patio o sala amplia'],
  ['Aguas Calientes', 'Cerca estación/plaza', 'USD 50-110', '1 noche funcional, check-in ágil']
];
s.addTable(rowsStay, {
  x: 0.55, y: 1.45, w: 12.3, h: 3.1,
  border: { type: 'solid', color: C.line, pt: 1 },
  fontSize: 12,
  color: C.text,
  fill: 'FFFFFF',
  colW: [1.9, 3.3, 2.0, 4.4]
});
s.addText('Estrategia PM: reservar 2 opciones por ciudad (Plan A / Plan B) para reaccionar a variación de precios.', {
  x: 0.7, y: 4.95, w: 11.8, h: 0.5, fontSize: 12.5, color: C.ok
});

s = pptx.addSlide();
header(s, 'Recomendaciones familiares (niña de 9 años)');
s.addText([
  { text: 'Altitud: día de llegada a Cusco = carga mínima; preferir Valle Sagrado como transición.\n', options: { bullet: { indent: 16 } } },
  { text: 'Cadencia diaria: bloque mañana (actividad) + bloque tarde (descanso/plan corto).\n', options: { bullet: { indent: 16 } } },
  { text: 'Transporte: evitar salidas de madrugada cuando sea posible.\n', options: { bullet: { indent: 16 } } },
  { text: 'Energía: snacks, hidratación y ropa por capas en mochila de día.\n', options: { bullet: { indent: 16 } } },
  { text: 'Flexibilidad: mantener el 13 ago como buffer para clima/fatiga.\n', options: { bullet: { indent: 16 } } },
  { text: 'Seguridad: seguro de viaje con cobertura de altura y eventual reprogramación.', options: { bullet: { indent: 16 } } }
], { x: 0.85, y: 1.5, w: 11.7, h: 4.8, fontSize: 19, color: C.text });

s = pptx.addSlide();
header(s, 'Presupuesto estimado total (USD) · 2 adultos + 1 niña');
const rowsBudget = [
  ['Rubro', 'Rango bajo', 'Rango alto'],
  ['Vuelos internacionales (SAL↔LIM x3)', '1,150', '2,150'],
  ['Vuelos internos (LIM↔CUZ x3)', '450', '850'],
  ['Alojamiento (10 noches)', '700', '1,300'],
  ['Trenes + entradas + buses turísticos', '500', '950'],
  ['Comidas + transporte local', '700', '1,200'],
  ['Seguro + contingencia (8-12%)', '250', '600'],
  ['TOTAL', '3,750', '7,050']
];
s.addTable(rowsBudget, {
  x: 1.2, y: 1.6, w: 10.5, h: 4.2,
  border: { type: 'solid', color: C.line, pt: 1 },
  fontSize: 15,
  color: C.text,
  fill: 'FFFFFF',
  colW: [5.5, 2.3, 2.3]
});

s = pptx.addSlide();
header(s, 'Checklist de reserva (orden recomendado de ejecución)');
s.addText([
  { text: '1) Definir presupuesto tope y ventanas horarias aceptables.\n', options: { bullet: { indent: 16 } } },
  { text: '2) Bloquear vuelos SAL↔LIM y luego LIM↔CUZ/CUZ↔LIM.\n', options: { bullet: { indent: 16 } } },
  { text: '3) Comprar Machu Picchu (circuito+hora) y tren asociado.\n', options: { bullet: { indent: 16 } } },
  { text: '4) Cerrar hospedajes en Lima/Cusco/Valle/A.C. (con cancelación flexible).\n', options: { bullet: { indent: 16 } } },
  { text: '5) Contratar seguro, preparar botiquín y kit de altura/sol.\n', options: { bullet: { indent: 16 } } },
  { text: '6) Confirmar traslados aeropuerto-hotel y documentación final.', options: { bullet: { indent: 16 } } }
], { x: 0.9, y: 1.6, w: 11.5, h: 4.6, fontSize: 20, color: C.text });
s.addText('Definición de listo (DoD): boletos emitidos + entradas pagadas + hospedajes confirmados + seguro activo + carpeta de viaje compartida.', {
  x: 0.9, y: 5.8, w: 11.5, h: 0.5, fontSize: 12.5, color: C.accent, bold: true
});

pptx.writeFile({ fileName: '/data/.openclaw/workspace/Peru_Itinerario_5-15_Agosto_Familia_SAL_Orquestado.pptx' });

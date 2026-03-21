const pptxgen = require('pptxgenjs');
const path = require('path');

const OUT = '/data/.openclaw/workspace/Peru_Itinerario_5-15_Agosto_Familia_SAL_Estilo_Peru.pptx';
const AS = '/data/.openclaw/workspace/assets/peru';

const img = (name) => path.join(AS, name);

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pptx.author = 'Atlas · Legolas PM';
pptx.company = 'OpenClaw';
pptx.subject = 'Itinerario familiar Perú 5-15 agosto desde SAL';
pptx.title = 'Perú Itinerario Estilo Perú';
pptx.lang = 'es-ES';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'es-ES'
};

const C = {
  rojo: 'C1121F',
  blanco: 'FFFFFF',
  tierra: '9C6644',
  arena: 'EDE0D4',
  cafe: '6F4E37',
  oscuro: '1B1B1B',
  gris: '4B5563'
};

function brandBar(s, title, subtitle = '') {
  s.background = { color: C.blanco };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.38, fill: { color: C.rojo }, line: { color: C.rojo } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.15, w: 13.333, h: 0.35, fill: { color: C.tierra }, line: { color: C.tierra } });
  s.addText(title, { x: 0.5, y: 0.48, w: 12.2, h: 0.5, fontSize: 28, bold: true, color: C.oscuro });
  if (subtitle) {
    s.addText(subtitle, { x: 0.52, y: 0.95, w: 12.1, h: 0.35, fontSize: 13, color: C.gris });
  }
}

// 1 Cover
let s = pptx.addSlide();
s.addImage({ path: img('cover_machu_picchu.jpg'), x: 0, y: 0, w: 13.333, h: 7.5 });
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: '000000', transparency: 45 }, line: { color: '000000', transparency: 100 } });
s.addShape(pptx.ShapeType.rect, { x: 0.7, y: 0.7, w: 8.3, h: 0.1, fill: { color: C.rojo }, line: { color: C.rojo } });
s.addText('Perú en Familia', { x: 0.7, y: 1.0, w: 8.8, h: 0.8, fontSize: 44, bold: true, color: C.blanco });
s.addText('5–15 de agosto 2026 · Salida desde SAL', { x: 0.72, y: 1.95, w: 8.5, h: 0.45, fontSize: 19, color: C.blanco });
s.addText('Ruta sugerida: Lima → Cusco → Valle Sagrado → Machu Picchu → Lima', { x: 0.72, y: 2.35, w: 9.8, h: 0.45, fontSize: 14, color: 'F3F4F6' });
s.addText('Plan pensado para 2 adultos + niña (9 años): ritmo amable, altura controlada, días buffer.', { x: 0.72, y: 6.55, w: 11.6, h: 0.4, fontSize: 12, color: 'E5E7EB' });

// 2 Overview route
s = pptx.addSlide();
brandBar(s, 'Resumen de Ruta (11 días / 10 noches)', 'Bloques de viaje para reducir cansancio y mantener flexibilidad');
s.addShape(pptx.ShapeType.roundRect, { x: 0.7, y: 1.55, w: 2.15, h: 1.0, fill: { color: 'FEE2E2' }, line: { color: C.rojo, pt: 1.2 } });
s.addText('SAL', { x: 1.47, y: 1.92, w: 0.9, h: 0.3, bold: true, color: C.rojo, fontSize: 18, align: 'center' });
s.addShape(pptx.ShapeType.chevron, { x: 2.98, y: 1.88, w: 0.8, h: 0.35, fill: { color: C.tierra }, line: { color: C.tierra } });
s.addShape(pptx.ShapeType.roundRect, { x: 3.95, y: 1.55, w: 2.15, h: 1.0, fill: { color: 'FFF7ED' }, line: { color: C.tierra, pt: 1.2 } });
s.addText('Lima\n(2 noches)', { x: 4.55, y: 1.74, w: 1.0, h: 0.6, bold: true, color: C.cafe, fontSize: 14, align: 'center' });
s.addShape(pptx.ShapeType.chevron, { x: 6.2, y: 1.88, w: 0.8, h: 0.35, fill: { color: C.tierra }, line: { color: C.tierra } });
s.addShape(pptx.ShapeType.roundRect, { x: 7.15, y: 1.55, w: 2.25, h: 1.0, fill: { color: 'ECFDF5' }, line: { color: '047857', pt: 1.2 } });
s.addText('Cusco +\nValle (6 noches)', { x: 7.56, y: 1.73, w: 1.4, h: 0.6, bold: true, color: '065F46', fontSize: 13, align: 'center' });
s.addShape(pptx.ShapeType.chevron, { x: 9.58, y: 1.88, w: 0.8, h: 0.35, fill: { color: C.tierra }, line: { color: C.tierra } });
s.addShape(pptx.ShapeType.roundRect, { x: 10.5, y: 1.55, w: 2.15, h: 1.0, fill: { color: 'EFF6FF' }, line: { color: '1D4ED8', pt: 1.2 } });
s.addText('Lima\n(2 noches)', { x: 11.05, y: 1.74, w: 1.1, h: 0.6, bold: true, color: '1E3A8A', fontSize: 14, align: 'center' });
s.addImage({ path: img('lima_miraflores.png'), x: 0.75, y: 3.0, w: 3.9, h: 3.7 });
s.addImage({ path: img('cusco_plaza.jpg'), x: 4.85, y: 3.0, w: 3.9, h: 3.7 });
s.addImage({ path: img('aguas_calientes.jpg'), x: 8.95, y: 3.0, w: 3.65, h: 3.7 });

// 3 Day by day
s = pptx.addSlide();
brandBar(s, 'Highlights Día por Día', 'Versión ligera: foco en experiencias clave + descansos');
const agenda = [
  '5 ago · Llegada a Lima, check-in y paseo corto en Miraflores.',
  '6 ago · Parque de las Leyendas + Circuito Mágico del Agua.',
  '7 ago · Vuelo LIM→CUZ, tarde de aclimatación y cena tranquila.',
  '8 ago · Pisac + mercado artesanal (ritmo suave).',
  '9 ago · Ollantaytambo o Maras/Moray (elegir solo 1 bloque).',
  '10 ago · Tren a Aguas Calientes y descanso temprano.',
  '11 ago · Machu Picchu temprano, retorno a Cusco.',
  '12 ago · Cusco ciudad: plan cultural corto + café/chocolate.',
  '13 ago · Día buffer: compras, descanso o ajuste por clima.',
  '14 ago · Vuelo CUZ→LIM, noche de conexión.',
  '15 ago · Regreso internacional LIM→SAL.'
];
let y = 1.45;
agenda.forEach((t) => {
  s.addShape(pptx.ShapeType.roundRect, { x: 0.75, y, w: 7.6, h: 0.42, fill: { color: 'FAFAF9' }, line: { color: 'D6D3D1', pt: 0.8 }, radius: 0.06 });
  s.addText(t, { x: 0.95, y: y + 0.08, w: 7.25, h: 0.25, fontSize: 12.2, color: C.oscuro });
  y += 0.47;
});
s.addImage({ path: img('sacred_valley.jpg'), x: 8.55, y: 1.55, w: 4.2, h: 2.4 });
s.addImage({ path: img('ollantaytambo.jpg'), x: 8.55, y: 4.15, w: 4.2, h: 2.35 });

// 4 Flights pricing
s = pptx.addSlide();
brandBar(s, 'Vuelos y precios estimados (USD)', 'Supuesto SAL con 1 escala · compra 8–16 semanas antes');
const flightRows = [
  ['Tramo', 'Horario sugerido', 'Duración aprox.', 'Rango estimado'],
  ['SAL → LIM (5 ago)', 'Salida mañana', '8–12 h', '380–720 p/p'],
  ['LIM → CUZ (7 ago)', '10:00–13:00', '1 h 20', '90–170 p/p'],
  ['CUZ → LIM (14 ago)', '14:00–18:00', '1 h 20', '90–170 p/p'],
  ['LIM → SAL (15 ago)', 'Media mañana/tarde', '8–12 h', '380–720 p/p']
];
s.addTable(flightRows, { x: 0.7, y: 1.6, w: 7.5, h: 2.8, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fill: 'FFFFFF', fontSize: 12, color: C.oscuro, colW: [2.2, 2.0, 1.5, 1.6] });
s.addText('Referencia de aerolíneas: Avianca/Copa/LATAM (internacional) y LATAM/Sky/JetSMART (doméstico).', { x: 0.72, y: 4.55, w: 7.6, h: 0.45, fontSize: 11.5, color: C.gris });
s.addImage({ path: img('lima_miraflores.png'), x: 8.55, y: 1.6, w: 4.1, h: 4.9 });

// 5 Tickets/entry
s = pptx.addSlide();
brandBar(s, 'Entradas y costos clave', 'Montos referenciales por persona o familia según rubro');
const ticketRows = [
  ['Concepto', 'Adulto', 'Niña (9)', 'Nota'],
  ['Machu Picchu (entrada)', '45–62', '20–35', 'Reservar circuito+hora con antelación'],
  ['Bus Aguas Calientes ↔ sitio', '24 RT', '12 RT', 'Compra cerca de fecha final'],
  ['Tren Ollanta ↔ A.C.', '120–220', '90–180', 'Varía por clase/horario'],
  ['Boleto Turístico Cusco', '20–25', '10–15', 'Útil para circuito corto'],
  ['Parque Leyendas + agua', '6–8', '3–5', 'Perfecto para día suave']
];
s.addTable(ticketRows, { x: 0.7, y: 1.55, w: 8.0, h: 3.5, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fill: 'FFFFFF', fontSize: 11.5, color: C.oscuro, colW: [2.9, 1.1, 1.2, 2.8] });
s.addImage({ path: img('aguas_calientes.jpg'), x: 8.9, y: 1.55, w: 3.75, h: 2.1 });
s.addImage({ path: img('peru_food.jpg'), x: 8.9, y: 3.85, w: 3.75, h: 2.2 });

// 6 Airbnb zones
s = pptx.addSlide();
brandBar(s, 'Airbnb sugerido por zona', 'Objetivo: seguridad + comodidad + logística sencilla con niña');
const stayRows = [
  ['Ciudad', 'Zona recomendada', 'Rango noche', 'Filtro clave'],
  ['Lima', 'Miraflores / San Isidro', '70–130', '4.8+, cocina, cancelación flexible'],
  ['Cusco', 'Centro tranquilo / Wanchaq', '55–110', 'Calefacción y acceso en taxi'],
  ['Valle Sagrado', 'Ollantaytambo / Urubamba', '60–140', 'Espacio familiar y patio/sala'],
  ['Aguas Calientes', 'Cerca estación/plaza', '50–110', 'Check-in ágil, 1 noche funcional']
];
s.addTable(stayRows, { x: 0.7, y: 1.62, w: 12.0, h: 2.7, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fill: 'FFFFFF', fontSize: 11.5, color: C.oscuro, colW: [1.7, 3.4, 1.5, 5.2] });
s.addText('Tip PM: reservar Plan A + Plan B (cancelación flexible) y decidir al cerrar vuelos.', { x: 0.8, y: 4.55, w: 8.1, h: 0.4, fontSize: 13, bold: true, color: C.rojo });
s.addImage({ path: img('cusco_plaza.jpg'), x: 9.0, y: 4.55, w: 3.6, h: 2.0 });

// 7 family considerations
s = pptx.addSlide();
brandBar(s, 'Viajando con niña de 9 años', 'Qué mantener fijo para que el viaje sea disfrutable (no solo “completo”)');
const tips = [
  'Aclimatación real: el día de llegada a Cusco es suave, sin caminatas largas.',
  'Bloques de energía: mañana activa + tarde liviana (máx. 2 actividades/día).',
  'Logística anti-estrés: snacks, agua, capas térmicas, protector solar y mini botiquín.',
  'Transporte: evitar madrugones consecutivos; priorizar traslados directos.',
  'Día 13 como buffer obligatorio para clima/fatiga/cambios de ánimo.',
  'Seguro de viaje con cobertura de altura y asistencia pediátrica.'
];
let yy = 1.55;
tips.forEach((t, i) => {
  s.addShape(pptx.ShapeType.ellipse, { x: 0.85, y: yy + 0.03, w: 0.28, h: 0.28, fill: { color: C.rojo }, line: { color: C.rojo } });
  s.addText(String(i + 1), { x: 0.93, y: yy + 0.08, w: 0.1, h: 0.14, fontSize: 10, bold: true, color: C.blanco, align: 'center' });
  s.addText(t, { x: 1.22, y: yy, w: 7.2, h: 0.34, fontSize: 12.5, color: C.oscuro });
  yy += 0.68;
});
s.addImage({ path: img('family_peru_lama.jpg'), x: 8.75, y: 1.7, w: 3.95, h: 4.8 });

// 8 Budget summary
s = pptx.addSlide();
brandBar(s, 'Presupuesto resumen (2 adultos + 1 niña)', 'Rango estimado total del viaje completo en USD');
const budgetRows = [
  ['Rubro', 'Bajo', 'Alto'],
  ['Vuelos internacionales (SAL↔LIM)', '1,150', '2,150'],
  ['Vuelos internos (LIM↔CUZ)', '450', '850'],
  ['Hospedaje (10 noches)', '700', '1,300'],
  ['Tren + entradas + buses', '500', '950'],
  ['Comidas + transporte local', '700', '1,200'],
  ['Seguro + contingencia', '250', '600'],
  ['TOTAL ESTIMADO', '3,750', '7,050']
];
s.addTable(budgetRows, { x: 0.8, y: 1.6, w: 6.9, h: 4.8, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fill: 'FFFFFF', fontSize: 13, color: C.oscuro, colW: [3.8, 1.5, 1.5] });
s.addShape(pptx.ShapeType.roundRect, { x: 8.2, y: 1.95, w: 4.3, h: 1.5, fill: { color: 'FEE2E2' }, line: { color: C.rojo, pt: 1 } });
s.addText('Meta recomendada de ahorro\nUSD 5,300 como punto medio', { x: 8.45, y: 2.35, w: 3.8, h: 0.8, fontSize: 16, bold: true, color: '7F1D1D', align: 'center' });
s.addShape(pptx.ShapeType.roundRect, { x: 8.2, y: 3.7, w: 4.3, h: 2.0, fill: { color: 'FFF7ED' }, line: { color: C.tierra, pt: 1 } });
s.addText('Control de riesgo:\n• Comprar vuelos primero\n• Entradas Machu justo después\n• Hospedaje con cancelación flexible', { x: 8.45, y: 4.0, w: 3.9, h: 1.4, fontSize: 12.2, color: C.cafe });

// 9 Packing/checklist
s = pptx.addSlide();
brandBar(s, 'Packing inteligente (familia)', 'Menos peso, más control: clima variable + altitud + trayectos');
const left = [
  'Documentos, pasaportes y seguros (copias digitales).',
  'Capas térmicas ligeras + impermeable + gorra.',
  'Zapato cómodo antideslizante (no estreno).',
  'Bloqueador solar, labial y lentes UV.',
  'Botiquín básico + medicación personal.'
];
const right = [
  'Snacks secos + botella reutilizable.',
  'Power bank, cargadores y adaptadores.',
  'Mini kit entretenimiento niña (cartas/libro).',
  '1 muda completa en equipaje de mano.',
  'Bolsa para ropa húmeda/lluvia.'
];
let y1 = 1.75;
left.forEach(t => { s.addText('✓ ' + t, { x: 0.9, y: y1, w: 5.9, h: 0.38, fontSize: 12.4, color: C.oscuro }); y1 += 0.62; });
let y2 = 1.75;
right.forEach(t => { s.addText('✓ ' + t, { x: 6.8, y: y2, w: 5.8, h: 0.38, fontSize: 12.4, color: C.oscuro }); y2 += 0.62; });
s.addImage({ path: img('peru_food.jpg'), x: 9.35, y: 4.9, w: 3.1, h: 1.9 });

// 10 Booking timeline
s = pptx.addSlide();
brandBar(s, 'Línea de tiempo de reservas', 'Ejecución por fases para evitar sobrecostos y estrés de última hora');
const tl = [
  ['Mayo (T-12 a T-10 semanas)', 'Cerrar presupuesto, pasaportes y vuelos internacionales.'],
  ['Junio (T-9 a T-6)', 'Comprar LIM↔CUZ + definir hospedajes base (Plan A/B).'],
  ['Julio inicio (T-5 a T-4)', 'Machu Picchu + tren + buses + actividades clave.'],
  ['Julio fin (T-3 a T-1)', 'Seguro, traslados, packing final y carpetas de viaje.'],
  ['Semana del viaje', 'Confirmaciones, check-in online y dinero fraccionado.']
];
let ty = 1.7;
tl.forEach(([fase,desc],i)=>{
  s.addShape(pptx.ShapeType.ellipse,{x:0.9,y:ty+0.05,w:0.24,h:0.24,fill:{color:C.rojo},line:{color:C.rojo}});
  if(i<tl.length-1) s.addShape(pptx.ShapeType.line,{x:1.02,y:ty+0.3,w:0,h:0.95,line:{color:'D1D5DB',pt:1.5}});
  s.addText(fase,{x:1.35,y:ty,w:3.3,h:0.25,fontSize:12.5,bold:true,color:C.cafe});
  s.addText(desc,{x:4.0,y:ty,w:8.4,h:0.35,fontSize:12.2,color:C.oscuro});
  ty+=1.1;
});

// 11 Closing divider
s = pptx.addSlide();
s.background = { color: C.rojo };
s.addShape(pptx.ShapeType.rect,{x:0.55,y:0.9,w:0.22,h:5.7,fill:{color:'FCD34D'},line:{color:'FCD34D'}});
s.addText('¡Listos para Perú!',{x:1.2,y:2.3,w:8.4,h:1.0,fontSize:48,bold:true,color:C.blanco});
s.addText('Plan familiar equilibrado: experiencia + descanso + control de presupuesto.',{x:1.25,y:3.35,w:10.8,h:0.6,fontSize:18,color:'FDECEC'});
s.addText('Próximo paso: confirmar vuelos SAL y bloquear Machu Picchu.',{x:1.25,y:4.05,w:10.5,h:0.5,fontSize:15,bold:true,color:'FFF7ED'});

pptx.writeFile({ fileName: OUT });

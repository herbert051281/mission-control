const pptxgen = require('pptxgenjs');
const path = require('path');

const OUT = '/data/.openclaw/workspace/Peru_Itinerario_5-15_Agosto_Familia_SAL_Estilo_Peru_V2_Squad.pptx';
const AS = '/data/.openclaw/workspace/assets/peru';

const img = (name) => path.join(AS, name);

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Atlas · Legolas PM';
pptx.company = 'OpenClaw';
pptx.subject = 'Itinerario familiar Perú 5-15 agosto desde SAL · V2 Squad';
pptx.title = 'Perú Itinerario Estilo Perú V2 Squad';
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
  cafe: '6F4E37',
  oscuro: '1B1B1B',
  gris: '4B5563'
};

function brandBar(s, title, subtitle = '') {
  s.background = { color: C.blanco };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.38, fill: { color: C.rojo }, line: { color: C.rojo } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.15, w: 13.333, h: 0.35, fill: { color: C.tierra }, line: { color: C.tierra } });
  s.addText(title, { x: 0.5, y: 0.48, w: 12.2, h: 0.5, fontSize: 27, bold: true, color: C.oscuro });
  if (subtitle) s.addText(subtitle, { x: 0.52, y: 0.95, w: 12.1, h: 0.35, fontSize: 12.5, color: C.gris });
}

function estFoot(s, txt = 'Cifras estimadas (USD), referenciales y sujetas a disponibilidad/tipo de cambio.') {
  s.addText(txt, { x: 0.72, y: 6.8, w: 12.0, h: 0.25, fontSize: 10.2, color: '6B7280', italic: true });
}

let s = pptx.addSlide();
s.addImage({ path: img('cover_machu_picchu.jpg'), x: 0, y: 0, w: 13.333, h: 7.5 });
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: '000000', transparency: 45 }, line: { color: '000000', transparency: 100 } });
s.addShape(pptx.ShapeType.rect, { x: 0.7, y: 0.7, w: 8.3, h: 0.1, fill: { color: C.rojo }, line: { color: C.rojo } });
s.addText('Perú en Familia · V2', { x: 0.7, y: 1.0, w: 8.8, h: 0.8, fontSize: 44, bold: true, color: C.blanco });
s.addText('5–15 de agosto 2026 · Salida SAL · 2 adultos + niña (9 años)', { x: 0.72, y: 1.95, w: 10.2, h: 0.45, fontSize: 18, color: C.blanco });
s.addText('Narrativa ejecutiva: experiencia, control de fatiga y presupuesto estimado.', { x: 0.72, y: 2.35, w: 9.8, h: 0.45, fontSize: 13.5, color: 'F3F4F6' });
s.addText('Fuente visual: imágenes Perú (Wikimedia Commons). Cifras = estimaciones.', { x: 0.72, y: 6.55, w: 11.6, h: 0.4, fontSize: 11.2, color: 'E5E7EB' });

s = pptx.addSlide();
brandBar(s, 'Resumen ejecutivo del viaje', 'Objetivo: máximo valor familiar con riesgo operativo controlado');
s.addTable([
  ['Tema', 'Decisión recomendada'],
  ['Ruta', 'SAL → Lima → Cusco/Valle Sagrado → Machu Picchu → Lima → SAL'],
  ['Ritmo', 'Bloques de energía (mañana activa + tarde ligera) + 1 día buffer'],
  ['Ventana de compra', '8–16 semanas antes para mejor relación costo/disponibilidad'],
  ['Presupuesto total', 'USD 3,750–7,050 (estimado); punto medio operativo: ~USD 5,300']
], { x: 0.72, y: 1.6, w: 7.7, h: 3.65, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fontSize: 12, colW: [2.4, 5.1] });
s.addImage({ path: img('sacred_valley.jpg'), x: 8.7, y: 1.6, w: 4.0, h: 2.1 });
s.addImage({ path: img('cusco_plaza.jpg'), x: 8.7, y: 3.95, w: 4.0, h: 2.1 });
estFoot(s);

s = pptx.addSlide();
brandBar(s, 'Ruta y fases (11 días / 10 noches)', 'Arquitectura de viaje para minimizar fricción de traslados');
s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.65, w: 2.15, h: 0.9, fill: { color: 'FEE2E2' }, line: { color: C.rojo, pt: 1.2 } });
s.addText('SAL', { x: 1.58, y: 1.98, w: 0.7, h: 0.25, bold: true, color: C.rojo, fontSize: 17, align: 'center' });
s.addShape(pptx.ShapeType.chevron, { x: 3.05, y: 1.9, w: 0.75, h: 0.33, fill: { color: C.tierra }, line: { color: C.tierra } });
s.addShape(pptx.ShapeType.roundRect, { x: 3.95, y: 1.65, w: 2.15, h: 0.9, fill: { color: 'FFF7ED' }, line: { color: C.tierra, pt: 1.2 } });
s.addText(`Lima\n(2N)`, { x: 4.58, y: 1.8, w: 1.0, h: 0.55, bold: true, color: C.cafe, fontSize: 13.5, align: 'center' });
s.addShape(pptx.ShapeType.chevron, { x: 6.25, y: 1.9, w: 0.75, h: 0.33, fill: { color: C.tierra }, line: { color: C.tierra } });
s.addShape(pptx.ShapeType.roundRect, { x: 7.15, y: 1.65, w: 2.45, h: 0.9, fill: { color: 'ECFDF5' }, line: { color: '047857', pt: 1.2 } });
s.addText(`Cusco + Valle\n(6N)`, { x: 7.63, y: 1.78, w: 1.5, h: 0.55, bold: true, color: '065F46', fontSize: 12.8, align: 'center' });
s.addShape(pptx.ShapeType.chevron, { x: 9.75, y: 1.9, w: 0.75, h: 0.33, fill: { color: C.tierra }, line: { color: C.tierra } });
s.addShape(pptx.ShapeType.roundRect, { x: 10.6, y: 1.65, w: 2.0, h: 0.9, fill: { color: 'EFF6FF' }, line: { color: '1D4ED8', pt: 1.2 } });
s.addText(`Lima\n(2N)`, { x: 11.1, y: 1.8, w: 1.0, h: 0.55, bold: true, color: '1E3A8A', fontSize: 13.5, align: 'center' });
s.addImage({ path: img('lima_miraflores.png'), x: 0.8, y: 2.95, w: 3.9, h: 3.65 });
s.addImage({ path: img('ollantaytambo.jpg'), x: 4.9, y: 2.95, w: 3.9, h: 3.65 });
s.addImage({ path: img('aguas_calientes.jpg'), x: 9.0, y: 2.95, w: 3.6, h: 3.65 });

s = pptx.addSlide();
brandBar(s, 'Agenda de alto nivel', 'Versión boardroom: qué importa cada día');
const agenda = [
  '5 ago: Llegada Lima + recuperación de vuelo.',
  '6 ago: Lima familiar (Parque Leyendas + agua).',
  '7 ago: Vuelo a Cusco + tarde de aclimatación.',
  '8–9 ago: Valle Sagrado (2 bloques, ritmo suave).',
  '10 ago: Traslado a Aguas Calientes + descanso.',
  '11 ago: Machu Picchu temprano + retorno.',
  '12 ago: Cusco ciudad (cultural ligero).',
  '13 ago: Día buffer (clima/fatiga/logística).',
  '14–15 ago: Retorno CUZ→LIM→SAL.'
];
let y = 1.55;
agenda.forEach((t) => {
  s.addShape(pptx.ShapeType.roundRect, { x: 0.78, y, w: 8.05, h: 0.45, fill: { color: 'FAFAF9' }, line: { color: 'D6D3D1', pt: 0.8 }, radius: 0.05 });
  s.addText(t, { x: 1.0, y: y + 0.1, w: 7.7, h: 0.25, fontSize: 12.3, color: C.oscuro });
  y += 0.53;
});
s.addImage({ path: img('sacred_valley.jpg'), x: 9.0, y: 1.6, w: 3.7, h: 2.4 });
s.addImage({ path: img('family_peru_lama.jpg'), x: 9.0, y: 4.2, w: 3.7, h: 2.3 });

s = pptx.addSlide();
brandBar(s, 'Vuelos: estructura y rangos de costo', 'Supuesto de compra anticipada y equipaje estándar');
s.addTable([
  ['Tramo', 'Duración aprox.', 'Rango estimado (USD p/p)'],
  ['SAL → LIM', '8–12 h', '380–720'],
  ['LIM → CUZ', '1 h 20', '90–170'],
  ['CUZ → LIM', '1 h 20', '90–170'],
  ['LIM → SAL', '8–12 h', '380–720']
], { x: 0.72, y: 1.65, w: 7.4, h: 2.65, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fontSize: 11.8, colW: [2.7, 1.8, 2.9] });
s.addText('Referencia de mercado: Avianca/Copa/LATAM (internacional), LATAM/Sky/JetSMART (doméstico).', { x: 0.72, y: 4.5, w: 7.5, h: 0.42, fontSize: 11.2, color: C.gris });
s.addImage({ path: img('lima_miraflores.png'), x: 8.45, y: 1.65, w: 4.2, h: 4.9 });
estFoot(s);

s = pptx.addSlide();
brandBar(s, 'Entradas y logística crítica', 'Qué reservar primero para evitar cuellos de botella');
s.addTable([
  ['Concepto', 'Rango estimado (USD)', 'Comentario operativo'],
  ['Machu Picchu (entrada)', 'Adulto 45–62 · Niña 20–35', 'Reservar circuito y hora con anticipación'],
  ['Tren Ollanta ↔ A.C.', 'Adulto 120–220 · Niña 90–180', 'Varía por clase y franja horaria'],
  ['Bus A.C. ↔ Santuario', 'Adulto 24 RT · Niña 12 RT', 'Compra cercana a fecha final'],
  ['Boleto turístico Cusco', 'Adulto 20–25 · Niña 10–15', 'Útil para plan cultural corto']
], { x: 0.72, y: 1.55, w: 8.3, h: 3.6, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fontSize: 11.2, colW: [2.55, 2.15, 3.6] });
s.addImage({ path: img('aguas_calientes.jpg'), x: 9.2, y: 1.55, w: 3.45, h: 2.2 });
s.addImage({ path: img('peru_food.jpg'), x: 9.2, y: 3.95, w: 3.45, h: 2.2 });
estFoot(s);

s = pptx.addSlide();
brandBar(s, 'Opciones recomendadas', '3 escenarios de decisión para comité familiar (estimaciones USD)');
s.addTable([
  ['Paquete', 'Perfil', 'Incluye', 'Rango total estimado'],
  ['Ahorro', 'Costo mínimo viable', 'Vuelos promo, hoteles funcionales, tren estándar', '3,750–4,600'],
  ['Balanceado', 'Mejor costo/experiencia', 'Vuelos intermedios, hospedaje 4.7+, buffers de descanso', '4,900–5,900'],
  ['Confort', 'Comodidad máxima', 'Horarios más cómodos, mejores ubicaciones y mayor contingencia', '6,200–7,050']
], { x: 0.72, y: 1.65, w: 12.0, h: 2.95, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fontSize: 11.4, colW: [1.6, 2.4, 5.1, 2.4] });
s.addShape(pptx.ShapeType.roundRect, { x: 0.75, y: 4.9, w: 12.0, h: 1.15, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', pt: 1 } });
s.addText('Recomendación Legolas Squad: iniciar con escenario Balanceado y escalar a Confort solo en tramos de mayor fricción (CUSCO llegada, Machu y retorno).', { x: 1.0, y: 5.18, w: 11.5, h: 0.55, fontSize: 12.2, color: C.oscuro, bold: true });
estFoot(s, 'Todos los montos son estimados y referenciales; validar tarifas al momento de compra.');

s = pptx.addSlide();
brandBar(s, 'Riesgos y mitigación', 'Marco Newton: supuestos de viaje + acciones preventivas');
s.addTable([
  ['Riesgo', 'Prob.', 'Impacto', 'Mitigación práctica'],
  ['Altitud (Cusco/Valle)', 'Media', 'Alto', 'Llegada suave, hidratación, sueño temprano, plan médico pediátrico'],
  ['Traslados y conexiones', 'Media', 'Medio/Alto', 'Evitar conexiones cortas, holgura mínima 3h, plan B terrestre'],
  ['Fatiga infantil', 'Alta', 'Medio', 'Máx. 2 actividades/día, snacks, pausas y día 13 buffer fijo'],
  ['Clima / logística agosto', 'Media', 'Medio', 'Capas térmicas, impermeable, reservas flexibles y confirmaciones T-72h']
], { x: 0.72, y: 1.65, w: 12.0, h: 3.6, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fontSize: 11.2, colW: [2.45, 0.9, 1.25, 7.4] });
s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 5.5, w: 12.0, h: 0.9, fill: { color: 'FEF3C7' }, line: { color: 'F59E0B', pt: 1 } });
s.addText('Supuesto clave (research): agosto suele ser seco en sierra, pero mañanas/noches frías y micro-variaciones por altura.', { x: 0.95, y: 5.78, w: 11.5, h: 0.35, fontSize: 11.4, color: '78350F' });

s = pptx.addSlide();
brandBar(s, 'Presupuesto consolidado familiar', '2 adultos + 1 niña · base para toma de decisión ejecutiva');
s.addTable([
  ['Rubro', 'Bajo', 'Alto'],
  ['Vuelos internacionales (SAL↔LIM)', '1,150', '2,150'],
  ['Vuelos internos (LIM↔CUZ)', '450', '850'],
  ['Hospedaje (10 noches)', '700', '1,300'],
  ['Tren + entradas + buses', '500', '950'],
  ['Comidas + transporte local', '700', '1,200'],
  ['Seguro + contingencia', '250', '600'],
  ['TOTAL ESTIMADO', '3,750', '7,050']
], { x: 0.8, y: 1.62, w: 6.95, h: 4.7, border: { pt: 1, color: 'D1D5DB', type: 'solid' }, fontSize: 12.5, colW: [3.9, 1.5, 1.5] });
s.addShape(pptx.ShapeType.roundRect, { x: 8.2, y: 2.0, w: 4.3, h: 1.4, fill: { color: 'FEE2E2' }, line: { color: C.rojo, pt: 1 } });
s.addText('Meta operativa sugerida:\nUSD ~5,300', { x: 8.45, y: 2.38, w: 3.8, h: 0.75, fontSize: 17, bold: true, color: '7F1D1D', align: 'center' });
s.addShape(pptx.ShapeType.roundRect, { x: 8.2, y: 3.7, w: 4.3, h: 2.1, fill: { color: 'FFF7ED' }, line: { color: C.tierra, pt: 1 } });
s.addText('Secuencia de compra sugerida:\n1) Vuelos\n2) Machu + tren\n3) Hospedajes flexibles\n4) Seguro y traslados', { x: 8.45, y: 4.0, w: 3.9, h: 1.55, fontSize: 12.0, color: C.cafe });
estFoot(s);

s = pptx.addSlide();
brandBar(s, 'Checklist final de ejecución', 'Última milla para salir sin fricción');
const left = ['Pasaportes + póliza + copias digitales', 'Capas térmicas / impermeable / UV', 'Medicinas personales + kit altura', 'Reservas críticas reconfirmadas (T-72h)', 'Equipaje de mano con muda completa'];
const right = ['Snacks + hidratación continua', 'Plan de entretenimiento para niña', 'Transfer aeropuerto preacordado', 'Dinero fraccionado / tarjetas activas', 'Contacto médico y emergencias visibles'];
let y1 = 1.72;
left.forEach(t => { s.addText('✓ ' + t, { x: 0.9, y: y1, w: 5.9, h: 0.35, fontSize: 12.0, color: C.oscuro }); y1 += 0.62; });
let y2 = 1.72;
right.forEach(t => { s.addText('✓ ' + t, { x: 6.85, y: y2, w: 5.8, h: 0.35, fontSize: 12.0, color: C.oscuro }); y2 += 0.62; });
s.addImage({ path: img('peru_food.jpg'), x: 9.4, y: 4.9, w: 3.1, h: 1.9 });

s = pptx.addSlide();
s.background = { color: C.rojo };
s.addShape(pptx.ShapeType.rect, { x: 0.55, y: 0.9, w: 0.22, h: 5.7, fill: { color: 'FCD34D' }, line: { color: 'FCD34D' } });
s.addText('Decisión lista para ejecutar', { x: 1.2, y: 2.2, w: 9.5, h: 1.0, fontSize: 45, bold: true, color: C.blanco });
s.addText('Perú familiar 2026: narrativa clara, presupuesto estimado y riesgos controlados.', { x: 1.25, y: 3.35, w: 11.0, h: 0.6, fontSize: 17, color: 'FDECEC' });
s.addText('Siguiente paso: congelar paquete (Ahorro / Balanceado / Confort) y abrir compras.', { x: 1.25, y: 4.02, w: 10.9, h: 0.5, fontSize: 14.6, bold: true, color: 'FFF7ED' });

pptx.writeFile({ fileName: OUT });

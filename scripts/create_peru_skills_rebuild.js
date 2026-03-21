const pptxgen = require('pptxgenjs');
const path = require('path');

const OUT = '/data/.openclaw/workspace/Peru_Itinerario_5-15_Agosto_Familia_SAL_Skills_Rebuild.pptx';
const AS = '/data/.openclaw/workspace/assets/peru';
const img = (name) => path.join(AS, name);

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pptx.author = 'Atlas · Legolas lead';
pptx.company = 'OpenClaw';
pptx.subject = 'Itinerario familiar Perú (5–15 agosto, salida SAL) - Skills Rebuild';
pptx.title = 'Perú Itinerario 5-15 Agosto Familia SAL - Skills Rebuild';
pptx.lang = 'es-ES';
pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'es-ES' };

// Design-token style palette (design-system-patterns)
const C = {
  rojo: 'B91C1C',
  rojoSuave: 'FEE2E2',
  azul: '1D4ED8',
  azulSuave: 'DBEAFE',
  verde: '047857',
  verdeSuave: 'D1FAE5',
  oro: 'B45309',
  oroSuave: 'FFEDD5',
  texto: '0F172A',
  textoSuave: '334155',
  borde: 'CBD5E1',
  fondo: 'F8FAFC',
  blanco: 'FFFFFF'
};

function base(slide, title, subtitle = '') {
  slide.background = { color: C.fondo };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.32, fill: { color: C.rojo }, line: { color: C.rojo } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.2, w: 13.333, h: 0.30, fill: { color: C.oro }, line: { color: C.oro } });
  slide.addText(title, { x: 0.55, y: 0.42, w: 12.1, h: 0.52, fontSize: 26, bold: true, color: C.texto });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.57, y: 0.95, w: 12.0, h: 0.30, fontSize: 12.5, color: C.textoSuave });
  }
}

function foot(slide, txt = 'Todas las cifras están en USD y son estimaciones referenciales (supuestos de mercado 2026).') {
  slide.addText(txt, { x: 0.7, y: 6.85, w: 12.0, h: 0.24, fontSize: 10.2, color: '64748B', italic: true });
}

// 1) Cover
let s = pptx.addSlide();
s.addImage({ path: img('cover_machu_picchu.jpg'), x: 0, y: 0, w: 13.333, h: 7.5 });
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: '000000', transparency: 44 }, line: { color: '000000', transparency: 100 } });
s.addShape(pptx.ShapeType.roundRect, { x: 0.78, y: 0.72, w: 6.9, h: 0.12, fill: { color: C.rojo }, line: { color: C.rojo } });
s.addText('Perú en Familia', { x: 0.8, y: 1.0, w: 8.2, h: 0.8, fontSize: 46, bold: true, color: C.blanco });
s.addText('5–15 de agosto 2026 · Salida SAL (San Salvador)', { x: 0.82, y: 1.95, w: 9.8, h: 0.45, fontSize: 19, color: 'F8FAFC' });
s.addText('2 adultos + niña de 9 años · Itinerario ejecutivo con ritmo familiar', { x: 0.82, y: 2.38, w: 9.8, h: 0.4, fontSize: 14.5, color: 'E2E8F0' });
s.addText('Versión Skills Rebuild: diseño premium + UX + legibilidad accesible', { x: 0.82, y: 6.6, w: 11.3, h: 0.32, fontSize: 11.2, color: 'E2E8F0' });

// 2) Executive summary
s = pptx.addSlide();
base(s, 'Resumen ejecutivo', 'Decisiones clave para aprobar ruta, ritmo y presupuesto');
s.addTable([
  ['Frente', 'Recomendación ejecutiva'],
  ['Ruta', 'SAL → Lima → Cusco/Valle Sagrado → Machu Picchu → Lima → SAL'],
  ['Ritmo', 'Mañanas activas + tardes ligeras + 1 día buffer para resiliencia'],
  ['Prioridad de reserva', '1) Vuelos, 2) Entrada Machu + tren, 3) Airbnb por zona'],
  ['Rango total estimado', 'USD 3,800–7,200 (objetivo balanceado: ~USD 5,400)']
], {
  x: 0.72, y: 1.55, w: 7.8, h: 3.8, fontSize: 12, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [2.7, 5.1]
});
s.addImage({ path: img('sacred_valley.jpg'), x: 8.85, y: 1.55, w: 3.8, h: 1.85 });
s.addImage({ path: img('cusco_plaza.jpg'), x: 8.85, y: 3.52, w: 3.8, h: 1.85 });
foot(s);

// 3) Route overview
s = pptx.addSlide();
base(s, 'Route overview (visión de ruta)', 'Arquitectura del viaje para minimizar fricción logística');
const blocks = [
  { x: 0.8, label: 'SAL\nSalida', fill: C.rojoSuave, stroke: C.rojo, tc: '7F1D1D' },
  { x: 3.35, label: 'Lima\n2 noches', fill: C.oroSuave, stroke: C.oro, tc: '7C2D12' },
  { x: 5.9, label: 'Cusco +\nValle (6N)', fill: C.verdeSuave, stroke: C.verde, tc: '065F46' },
  { x: 8.45, label: 'Machu Picchu\n1 día', fill: C.azulSuave, stroke: C.azul, tc: '1E3A8A' },
  { x: 11.0, label: 'Lima\n2 noches', fill: C.oroSuave, stroke: C.oro, tc: '7C2D12' }
];
blocks.forEach((b) => {
  s.addShape(pptx.ShapeType.roundRect, { x: b.x, y: 1.7, w: 2.0, h: 0.95, fill: { color: b.fill }, line: { color: b.stroke, pt: 1.2 } });
  s.addText(b.label, { x: b.x + 0.15, y: 1.95, w: 1.7, h: 0.5, align: 'center', fontSize: 13, bold: true, color: b.tc });
});
for (let i = 0; i < 4; i++) {
  s.addShape(pptx.ShapeType.chevron, { x: 2.9 + i * 2.55, y: 2.0, w: 0.38, h: 0.26, fill: { color: '94A3B8' }, line: { color: '94A3B8' } });
}
s.addImage({ path: img('lima_miraflores.png'), x: 0.82, y: 3.1, w: 3.95, h: 3.45 });
s.addImage({ path: img('ollantaytambo.jpg'), x: 4.92, y: 3.1, w: 3.95, h: 3.45 });
s.addImage({ path: img('aguas_calientes.jpg'), x: 9.02, y: 3.1, w: 3.45, h: 3.45 });

// 4) Day-by-day highlights
s = pptx.addSlide();
base(s, 'Highlights día por día (5–15 agosto)', 'Secuencia breve, orientada a energía familiar');
s.addTable([
  ['Día', 'Enfoque', 'Highlight principal'],
  ['5 ago', 'Llegada a Lima', 'Check-in temprano + descanso activo en Miraflores'],
  ['6 ago', 'Lima familiar', 'Parque de las Leyendas / Malecón + comida ligera'],
  ['7 ago', 'Vuelo LIM→CUZ', 'Aclimatación: solo caminata corta y temprano a dormir'],
  ['8 ago', 'Valle Sagrado', 'Pisac + mercado artesanal (ritmo suave)'],
  ['9 ago', 'Valle Sagrado', 'Ollantaytambo + tren al final del día'],
  ['10 ago', 'Aguas Calientes', 'Día de transición y descanso logístico'],
  ['11 ago', 'Machu Picchu', 'Ingreso temprano + retorno progresivo'],
  ['12 ago', 'Cusco ciudad', 'Plaza/centro histórico + actividad corta para niña'],
  ['13 ago', 'Día buffer', 'Reserva para clima, fatiga o actividad extra'],
  ['14–15 ago', 'Retorno', 'CUZ→LIM→SAL con conexión holgada']
], {
  x: 0.7, y: 1.5, w: 12.0, h: 4.95, fontSize: 10.8, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [1.2, 2.3, 8.5]
});
foot(s);

// 5) Flights + estimated prices
s = pptx.addSlide();
base(s, 'Vuelos y precios estimados', 'Supuestos: compra anticipada 8–16 semanas, equipaje estándar');
s.addTable([
  ['Tramo', 'Tiempo aprox.', 'Rango estimado p/p (USD)', 'Supuesto'],
  ['SAL → LIM', '8–12 h', '390–730', 'Con 1 escala, temporada alta moderada'],
  ['LIM → CUZ', '1h 20m', '95–180', 'Tarifa intermedia con carry-on'],
  ['CUZ → LIM', '1h 20m', '95–180', 'Similar al tramo de ida'],
  ['LIM → SAL', '8–12 h', '390–730', 'Flexibilidad mejora precio final']
], {
  x: 0.72, y: 1.58, w: 8.25, h: 2.95, fontSize: 11.3, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [2.1, 1.6, 2.1, 2.45]
});
s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 4.75, w: 8.25, h: 1.1, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', pt: 1 } });
s.addText('Estimación familiar (3 pax): vuelos total entre USD 2,100 y USD 4,300.\nSupuesto explícito: precios pueden variar por demanda y tipo de cambio.', {
  x: 0.95, y: 5.03, w: 7.8, h: 0.7, fontSize: 11.3, color: '1E3A8A', bold: true
});
s.addImage({ path: img('lima_miraflores.png'), x: 9.25, y: 1.58, w: 3.45, h: 4.3 });
foot(s);

// 6) Attraction/entry costs
s = pptx.addSlide();
base(s, 'Costos de atracciones y entradas', 'Reservas críticas para evitar cuellos de botella');
s.addTable([
  ['Actividad / Entrada', 'Adulto (USD)', 'Niña 9 años (USD)', 'Notas'],
  ['Machu Picchu (entrada)', '45–62', '20–35', 'Comprar circuito + hora con anticipación'],
  ['Tren Ollanta ↔ Aguas C.', '120–220', '90–180', 'Varía por clase y horario'],
  ['Bus Aguas C. ↔ Santuario (RT)', '24', '12', 'Compra cercana a fecha final'],
  ['Boleto Turístico Cusco', '20–25', '10–15', 'Útil para visitas culturales cortas'],
  ['Sitios/museos en Lima', '5–15', '3–8', 'Costo promedio por atracción']
], {
  x: 0.72, y: 1.58, w: 8.5, h: 3.55, fontSize: 11.1, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [2.6, 1.3, 1.6, 3.0]
});
s.addImage({ path: img('aguas_calientes.jpg'), x: 9.45, y: 1.58, w: 3.2, h: 1.95 });
s.addImage({ path: img('peru_food.jpg'), x: 9.45, y: 3.75, w: 3.2, h: 1.95 });
foot(s);

// 7) Airbnb suggestions by zone
s = pptx.addSlide();
base(s, 'Airbnb sugeridos por zona (familia)', 'Criterios UX: seguridad, caminabilidad, ruido bajo, acceso a servicios');
s.addTable([
  ['Ciudad', 'Zona recomendada', 'Perfil ideal', 'Rango estimado/noche (USD)'],
  ['Lima', 'Miraflores', 'Primera llegada familiar, servicios cercanos, parques', '55–110'],
  ['Lima', 'Barranco (tranquilo)', 'Ambiente cultural, caminable, buen food scene', '50–105'],
  ['Cusco', 'San Blas bajo', 'Acceso al centro con pendiente moderada', '45–95'],
  ['Cusco', 'Centro histórico plano', 'Menos caminata exigente para niña', '50–100'],
  ['Valle Sagrado', 'Urubamba', 'Base logística para tours con mejor descanso', '55–120'],
  ['Aguas Calientes', 'Zona estación/centro', 'Minimizar traslados previos a Machu', '60–140']
], {
  x: 0.7, y: 1.56, w: 12.0, h: 3.9, fontSize: 10.7, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [1.3, 2.4, 5.2, 2.3]
});
s.addShape(pptx.ShapeType.roundRect, { x: 0.7, y: 5.65, w: 12.0, h: 0.95, fill: { color: C.verdeSuave }, line: { color: '86EFAC', pt: 1 } });
s.addText('Supuesto: preferir propiedades con reseñas >4.7, check-in flexible y cancelación moderada para gestionar clima/altitud.', {
  x: 0.95, y: 5.94, w: 11.5, h: 0.4, fontSize: 11.2, color: '14532D', bold: true
});
foot(s);

// 8) Family considerations for 9-year-old
s = pptx.addSlide();
base(s, 'Consideraciones familiares (niña de 9 años)', 'Diseño de experiencia: seguridad, energía y engagement diario');
s.addImage({ path: img('family_peru_lama.jpg'), x: 8.9, y: 1.52, w: 3.8, h: 4.95 });
const items = [
  'Altitud: priorizar hidratación, sueño temprano y ritmo gradual 48h.',
  'Carga diaria: máximo 2 actividades núcleo + 1 bloque libre.',
  'Nutrición: snacks frecuentes, desayuno completo, evitar saltos largos de comida.',
  'Confort: capas térmicas, protector solar, gorra y plan lluvia ligera.',
  'Motivación: incluir actividades lúdicas (mercados, llamas, fotos, tren).',
  'Seguridad: puntos de encuentro claros y pulsera con contacto.'
];
let yy = 1.62;
items.forEach((t) => {
  s.addShape(pptx.ShapeType.roundRect, { x: 0.75, y: yy, w: 7.8, h: 0.66, fill: { color: C.blanco }, line: { color: C.borde, pt: 1 } });
  s.addText('• ' + t, { x: 1.0, y: yy + 0.18, w: 7.3, h: 0.32, fontSize: 11.6, color: C.texto });
  yy += 0.77;
});

// 9) Budget scenarios
s = pptx.addSlide();
base(s, 'Escenarios de presupuesto (estimado)', 'Comparación Ahorro / Balanceado / Confort para decisión final');
s.addTable([
  ['Escenario', 'Perfil', 'Qué prioriza', 'Rango total estimado (USD)'],
  ['Ahorro', 'Costo mínimo viable', 'Tarifas promo, hospedaje funcional, logística eficiente', '3,800–4,700'],
  ['Balanceado', 'Mejor valor familiar', 'Comodidad razonable + buffers de descanso', '5,000–5,900'],
  ['Confort', 'Menor fricción', 'Horarios óptimos, ubicaciones premium, mayor contingencia', '6,300–7,200']
], {
  x: 0.72, y: 1.58, w: 12.0, h: 2.85, fontSize: 11.3, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [1.7, 2.3, 5.5, 2.3]
});
s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 4.75, w: 12.0, h: 1.45, fill: { color: 'FEF3C7' }, line: { color: 'FCD34D', pt: 1 } });
s.addText('Recomendación: iniciar en Balanceado y subir selectivamente a Confort en 3 puntos críticos: llegada a Cusco, noche previa a Machu Picchu y retorno internacional.', {
  x: 0.95, y: 5.08, w: 11.5, h: 0.8, fontSize: 12.2, color: '78350F', bold: true
});
foot(s);

// 10) Risks + mitigation
s = pptx.addSlide();
base(s, 'Riesgos y mitigación', 'Matriz simple para operación familiar sin sorpresas');
s.addTable([
  ['Riesgo', 'Prob.', 'Impacto', 'Mitigación recomendada'],
  ['Altitud (Cusco/Valle)', 'Media', 'Alto', 'Aclimatación gradual, hidratación, descanso, validación médica previa'],
  ['Conexiones aéreas', 'Media', 'Medio/Alto', 'Evitar conexiones cortas, holgura >= 3h, plan alterno'],
  ['Fatiga infantil', 'Alta', 'Medio', 'Límites de actividad, pausas activas, día buffer fijo'],
  ['Clima y variabilidad', 'Media', 'Medio', 'Capas térmicas, impermeable, reservas flexibles'],
  ['Saturación de atractivos', 'Media', 'Alto', 'Comprar entradas clave con anticipación']
], {
  x: 0.72, y: 1.58, w: 12.0, h: 3.55, fontSize: 11.1, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [2.3, 0.9, 1.2, 7.6]
});
s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 5.38, w: 12.0, h: 0.9, fill: { color: C.rojoSuave }, line: { color: 'FCA5A5', pt: 1 } });
s.addText('Supuesto clave: agosto suele favorecer clima seco en sierra, pero con mañanas/noches frías y variaciones por altura.', {
  x: 0.95, y: 5.66, w: 11.3, h: 0.36, fontSize: 11.2, color: '7F1D1D', bold: true
});
foot(s);

// 11) Booking checklist & timeline
s = pptx.addSlide();
base(s, 'Checklist y timeline de reservas', 'Plan de ejecución recomendado (T = fecha de salida)');
s.addTable([
  ['Ventana', 'Acción', 'Detalle de control'],
  ['T-16 a T-12 semanas', 'Bloquear vuelos internacionales e internos', 'Buscar ventanas de menor precio, validar equipaje'],
  ['T-12 a T-10 semanas', 'Reservar Machu + tren', 'Confirmar circuito/hora y políticas de cambio'],
  ['T-10 a T-8 semanas', 'Cerrar Airbnb por zona', 'Priorizar reseñas altas + cancelación flexible'],
  ['T-6 a T-4 semanas', 'Seguro, traslados, entradas secundarias', 'Documentos y coberturas familiares'],
  ['T-2 semanas', 'Reconfirmación integral', 'Vuelos, check-ins, clima, medicamentos'],
  ['T-72h', 'Checklist final de salida', 'Copias de documentos, efectivo fraccionado, contactos de emergencia']
], {
  x: 0.72, y: 1.56, w: 12.0, h: 4.25, fontSize: 10.9, border: { pt: 1, color: C.borde, type: 'solid' }, colW: [2.1, 3.2, 6.7]
});

// 12) Closing
s = pptx.addSlide();
s.background = { color: C.rojo };
s.addShape(pptx.ShapeType.rect, { x: 0.65, y: 0.85, w: 0.22, h: 5.8, fill: { color: 'FDE68A' }, line: { color: 'FDE68A' } });
s.addText('Listo para reservar', { x: 1.2, y: 2.05, w: 9.3, h: 0.95, fontSize: 48, bold: true, color: C.blanco });
s.addText('Itinerario familiar optimizado para experiencia + control de riesgo.', { x: 1.25, y: 3.2, w: 11.0, h: 0.55, fontSize: 18, color: 'FEF2F2' });
s.addText('Siguiente decisión: elegir escenario (Ahorro / Balanceado / Confort) y ejecutar timeline.', { x: 1.25, y: 3.95, w: 11.2, h: 0.5, fontSize: 14.8, bold: true, color: 'FFEDD5' });
s.addText('Nota: todos los costos presentados son estimaciones con supuestos.', { x: 1.25, y: 6.45, w: 11.2, h: 0.35, fontSize: 11.2, color: 'FEE2E2' });

pptx.writeFile({ fileName: OUT });

/**
 * Apps Script Web App — backend del investment-dashboard.
 *
 * Guarda los datos en formato fila-por-registro (legible en el Sheet):
 *   - Hoja "Inversiones": una fila por inversión, con columnas.
 *   - Hoja "Historial":   una fila por snapshot (totales) + columna "detalle"
 *     con el desglose por inversión serializado en JSON.
 *
 * Las hojas y sus encabezados se crean solos si no existen.
 *
 * Despliegue: Implementar -> Nueva implementación -> Web App
 *   - Ejecutar como: Yo
 *   - Quién tiene acceso: Cualquier persona
 * El proxy /api/sheets en Vercel agrega ?token=... ; debe coincidir con TOKEN.
 */

const TOKEN = 'PEGA_AQUI_TU_SHEETS_TOKEN'; // mismo valor que SHEETS_TOKEN en Vercel

const INV_SHEET = 'Inversiones';
const HIST_SHEET = 'Historial';
const INV_HEADERS = ['id', 'name', 'platform', 'aporte', 'valorActual', 'tipo', 'color', 'updatedAt'];
const HIST_HEADERS = ['fecha', 'totalActual', 'totalAporte', 'ganancia', 'pct', 'detalle'];

function doGet(e) {
  if (e.parameter.token !== TOKEN) return json({ error: 'Unauthorized' });
  return json({ investments: readInvestments(), history: readHistory() });
}

function doPost(e) {
  if (e.parameter.token !== TOKEN) return json({ error: 'Unauthorized' });
  const data = JSON.parse(e.postData.contents);
  if (data.investments !== undefined) writeInvestments(data.investments);
  if (data.history !== undefined) writeHistory(data.history);
  return json({ ok: true });
}

function ss() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name, headers) {
  let sh = ss().getSheetByName(name);
  if (!sh) sh = ss().insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}

// Sheets puede auto-convertir un ISO string a Date; normalizamos de vuelta a ISO.
function toIso(v) {
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function readInvestments() {
  const sh = getSheet(INV_SHEET, INV_HEADERS);
  const rows = sh.getDataRange().getValues();
  rows.shift(); // descartar encabezado
  return rows
    .filter(function (r) { return r[0] !== '' && r[0] !== null; })
    .map(function (r) {
      return {
        id: Number(r[0]),
        name: String(r[1]),
        platform: String(r[2]),
        aporte: Number(r[3]),
        valorActual: Number(r[4]),
        tipo: String(r[5]),
        color: String(r[6]),
        updatedAt: toIso(r[7]),
      };
    });
}

function writeInvestments(items) {
  const sh = getSheet(INV_SHEET, INV_HEADERS);
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, INV_HEADERS.length).clearContent();
  }
  if (items.length) {
    const values = items.map(function (i) {
      return [i.id, i.name, i.platform, i.aporte, i.valorActual, i.tipo, i.color, i.updatedAt];
    });
    sh.getRange(2, 1, values.length, INV_HEADERS.length).setValues(values);
  }
}

function readHistory() {
  const sh = getSheet(HIST_SHEET, HIST_HEADERS);
  const rows = sh.getDataRange().getValues();
  rows.shift();
  return rows
    .filter(function (r) { return r[0] !== '' && r[0] !== null; })
    .map(function (r) {
      return {
        fecha: toIso(r[0]),
        totalActual: Number(r[1]),
        totalAporte: Number(r[2]),
        ganancia: Number(r[3]),
        pct: Number(r[4]),
        investments: r[5] ? JSON.parse(r[5]) : [],
      };
    });
}

function writeHistory(items) {
  const sh = getSheet(HIST_SHEET, HIST_HEADERS);
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, HIST_HEADERS.length).clearContent();
  }
  if (items.length) {
    const values = items.map(function (s) {
      return [s.fecha, s.totalActual, s.totalAporte, s.ganancia, s.pct, JSON.stringify(s.investments || [])];
    });
    sh.getRange(2, 1, values.length, HIST_HEADERS.length).setValues(values);
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

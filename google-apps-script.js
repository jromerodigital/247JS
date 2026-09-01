/**
 * GOOGLE APPS SCRIPT FOR VIBELOVE SAAS BACKEND (GOOGLE SHEETS RELATIONAL DATABASE)
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN EN GOOGLE SHEETS:
 * 1. Abre tu Google Sheet en https://sheets.google.com
 * 2. Crea 2 pestañas abajo con estos nombres exactos:
 *    - "Usuarios" (Fila 1 Encabezados: ID | Nombre | Apellido | Email | Password | FechaRegistro)
 *    - "Dedicatorias" (Fila 1 Encabezados: ID | Slug | UserEmail | PartnerName | SenderName | Title | DataJSON | FechaCreacion)
 * 3. Ve al menú superior: Extensiones -> Apps Script
 * 4. Pega este código completo reemplazando todo.
 * 5. Haz clic en "Desplegar" -> "Nuevo despliegue" -> Selecciona "Aplicación web".
 * 6. Configura:
 *    - Ejecutar como: Tu cuenta (Yo)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 7. Copia la URL del despliegue (termina en /exec) y pógala en tu variable de entorno VITE_APPS_SCRIPT_URL.
 */

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const data = contents.data;

    let response = { success: false, error: 'Acción no válida' };

    if (action === 'register') {
      response = registerUser(data);
    } else if (action === 'login') {
      response = loginUser(data);
    } else if (action === 'saveDedication') {
      response = saveDedication(data);
    } else if (action === 'getDedication') {
      response = getDedication(data.slug);
    } else if (action === 'getUserDedications') {
      response = getUserDedications(data.email);
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const slug = e.parameter.slug;
  if (slug) {
    const response = getDedication(slug);
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const email = e.parameter.email;
  if (email) {
    const response = getUserDedications(email);
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Servidor VibeLove Apps Script activo.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------- FUNCIONES RELACIONALES DE BASE DE DATOS ----------------

function registerUser(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) return { success: false, error: 'La pestaña "Usuarios" no existe en la hoja de cálculo.' };

  const rows = sheet.getDataRange().getValues();

  // Verificar si ya existe el email
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][3] && rows[i][3].toString().toLowerCase() === data.email.toLowerCase()) {
      return { success: false, error: 'El correo electrónico ya está registrado.' };
    }
  }

  const userId = 'usr_' + Date.now();
  sheet.appendRow([userId, data.name || '', data.lastName || '', data.email, data.password, new Date().toISOString()]);

  return {
    success: true,
    user: { id: userId, name: data.name, lastName: data.lastName, email: data.email }
  };
}

function loginUser(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) return { success: false, error: 'La pestaña "Usuarios" no existe.' };

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const rowEmail = rows[i][3] ? rows[i][3].toString().toLowerCase() : '';
    const rowPass = rows[i][4] ? rows[i][4].toString() : '';

    if (rowEmail === data.email.toLowerCase() && rowPass === data.password) {
      return {
        success: true,
        user: { id: rows[i][0], name: rows[i][1], lastName: rows[i][2], email: rows[i][3] }
      };
    }
  }

  return { success: false, error: 'Correo o contraseña incorrectos.' };
}

function saveDedication(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dedicatorias');
  if (!sheet) return { success: false, error: 'La pestaña "Dedicatorias" no existe.' };

  const rows = sheet.getDataRange().getValues();

  let foundRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] && rows[i][1].toString().toLowerCase() === data.slug.toLowerCase()) {
      foundRow = i + 1; // 1-indexed
      break;
    }
  }

  const jsonString = JSON.stringify(data);
  const now = new Date().toISOString();

  if (foundRow > 0) {
    sheet.getRange(foundRow, 3).setValue(data.userEmail || '');
    sheet.getRange(foundRow, 4).setValue(data.partnerName || '');
    sheet.getRange(foundRow, 5).setValue(data.senderName || '');
    sheet.getRange(foundRow, 6).setValue(data.title || '');
    sheet.getRange(foundRow, 7).setValue(jsonString);
    sheet.getRange(foundRow, 8).setValue(now);
  } else {
    sheet.appendRow([
      data.id || 'ded_' + Date.now(),
      data.slug,
      data.userEmail || '',
      data.partnerName || '',
      data.senderName || '',
      data.title || '',
      jsonString,
      now
    ]);
  }

  return { success: true, slug: data.slug };
}

function getDedication(slug) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dedicatorias');
  if (!sheet) return { success: false, error: 'La pestaña "Dedicatorias" no existe.' };

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] && rows[i][1].toString().toLowerCase() === slug.toLowerCase()) {
      try {
        const jsonData = JSON.parse(rows[i][6]);
        return { success: true, data: jsonData };
      } catch (e) {
        return { success: false, error: 'Error al procesar los datos de la dedicatoria.' };
      }
    }
  }

  return { success: false, error: 'Dedicatoria no encontrada.' };
}

function getUserDedications(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dedicatorias');
  if (!sheet) return { success: true, dedications: [] };

  const rows = sheet.getDataRange().getValues();
  const list = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] && rows[i][2].toString().toLowerCase() === email.toLowerCase()) {
      try {
        list.push(JSON.parse(rows[i][6]));
      } catch (e) {}
    }
  }

  return { success: true, dedications: list };
}

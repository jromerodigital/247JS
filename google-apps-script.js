/**
 * ============================================================
 * VIBELOVE - BACKEND EN GOOGLE SHEETS (Apps Script)
 * ============================================================
 * 
 * PASOS PARA CONFIGURAR:
 * 
 * 1. Abre https://sheets.google.com y crea una hoja nueva
 *    (ponle de nombre "VibeLove Backend" o el que prefieras).
 * 
 * 2. En el menú superior ve a: Extensiones → Apps Script
 * 
 * 3. Borra todo el código que aparece y pega este archivo completo.
 * 
 * 4. Haz clic en el botón ▶ "Ejecutar" con la función
 *    "inicializarTablas" seleccionada en el dropdown.
 *    → Esto creará automáticamente las pestañas "Usuarios"
 *      y "Dedicatorias" con sus encabezados.
 *    → Te pedirá permisos la primera vez, acéptalos.
 * 
 * 5. Ve a: Desplegar → Nuevo despliegue
 *    - Tipo: "Aplicación web"
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: "Cualquier persona"
 *    → Copia la URL que termina en /exec
 * 
 * 6. En tu proyecto crea un archivo .env en la raíz con:
 *    VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_ID/exec
 * 
 * ¡Listo! Tu backend está funcionando.
 * ============================================================
 */


// ================================================================
// PASO 1: EJECUTA ESTA FUNCIÓN UNA SOLA VEZ PARA CREAR LAS TABLAS
// ================================================================

function inicializarTablas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // ─── Crear pestaña "Usuarios" ───
  var sheetUsuarios = ss.getSheetByName('Usuarios');
  if (!sheetUsuarios) {
    sheetUsuarios = ss.insertSheet('Usuarios');
    Logger.log('✅ Pestaña "Usuarios" creada.');
  } else {
    Logger.log('ℹ️ La pestaña "Usuarios" ya existe.');
  }
  
  // Escribir encabezados en fila 1
  var headerUsuarios = ['ID', 'Nombre', 'Apellido', 'Email', 'Password', 'WhatsApp', 'FechaRegistro'];
  sheetUsuarios.getRange(1, 1, 1, headerUsuarios.length).setValues([headerUsuarios]);
  sheetUsuarios.getRange(1, 1, 1, headerUsuarios.length)
    .setFontWeight('bold')
    .setBackground('#C27A7E')
    .setFontColor('#FFFFFF');
  sheetUsuarios.setFrozenRows(1);
  
  // Ajustar ancho de columnas
  sheetUsuarios.setColumnWidth(1, 160);  // ID
  sheetUsuarios.setColumnWidth(2, 140);  // Nombre
  sheetUsuarios.setColumnWidth(3, 140);  // Apellido
  sheetUsuarios.setColumnWidth(4, 220);  // Email
  sheetUsuarios.setColumnWidth(5, 140);  // Password
  sheetUsuarios.setColumnWidth(6, 160);  // WhatsApp
  sheetUsuarios.setColumnWidth(7, 180);  // FechaRegistro
  
  // ─── Crear pestaña "Dedicatorias" ───
  var sheetDedicatorias = ss.getSheetByName('Dedicatorias');
  if (!sheetDedicatorias) {
    sheetDedicatorias = ss.insertSheet('Dedicatorias');
    Logger.log('✅ Pestaña "Dedicatorias" creada.');
  } else {
    Logger.log('ℹ️ La pestaña "Dedicatorias" ya existe.');
  }
  
  // Escribir encabezados en fila 1
  var headerDedicatorias = ['ID', 'Slug', 'UserEmail', 'PartnerName', 'SenderName', 'Title', 'DataJSON', 'FechaCreacion'];
  sheetDedicatorias.getRange(1, 1, 1, headerDedicatorias.length).setValues([headerDedicatorias]);
  sheetDedicatorias.getRange(1, 1, 1, headerDedicatorias.length)
    .setFontWeight('bold')
    .setBackground('#C27A7E')
    .setFontColor('#FFFFFF');
  sheetDedicatorias.setFrozenRows(1);
  
  // Ajustar ancho de columnas
  sheetDedicatorias.setColumnWidth(1, 160);  // ID
  sheetDedicatorias.setColumnWidth(2, 180);  // Slug
  sheetDedicatorias.setColumnWidth(3, 220);  // UserEmail
  sheetDedicatorias.setColumnWidth(4, 140);  // PartnerName
  sheetDedicatorias.setColumnWidth(5, 140);  // SenderName
  sheetDedicatorias.setColumnWidth(6, 200);  // Title
  sheetDedicatorias.setColumnWidth(7, 400);  // DataJSON
  sheetDedicatorias.setColumnWidth(8, 180);  // FechaCreacion
  
  // ─── Eliminar la hoja por defecto "Hoja 1" si existe y está vacía ───
  var hojaDefault = ss.getSheetByName('Hoja 1');
  if (hojaDefault && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(hojaDefault);
      Logger.log('🗑️ Hoja "Hoja 1" eliminada.');
    } catch(e) {}
  }
  
  Logger.log('');
  Logger.log('══════════════════════════════════════════');
  Logger.log('✅ ¡TABLAS CREADAS CORRECTAMENTE!');
  Logger.log('══════════════════════════════════════════');
  Logger.log('Ahora ve a: Desplegar → Nuevo despliegue');
  Logger.log('Tipo: Aplicación web');
  Logger.log('Ejecutar como: Yo');
  Logger.log('Acceso: Cualquier persona');
  Logger.log('══════════════════════════════════════════');
}


// ================================================================
// API ENDPOINTS (NO TOCAR - Funcionan automáticamente al desplegar)
// ================================================================

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var data = contents.data;

    var response = { success: false, error: 'Acción no válida' };

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
  var slug = e.parameter.slug;
  if (slug) {
    var response = getDedication(slug);
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var email = e.parameter.email;
  if (email) {
    var response2 = getUserDedications(email);
    return ContentService
      .createTextOutput(JSON.stringify(response2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Servidor VibeLove Apps Script activo.' }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ================================================================
// FUNCIONES DE BASE DE DATOS RELACIONAL
// ================================================================

// ─── REGISTRO DE USUARIO ───
function registerUser(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) return { success: false, error: 'La pestaña "Usuarios" no existe. Ejecuta inicializarTablas() primero.' };

  var rows = sheet.getDataRange().getValues();

  // Verificar si ya existe el email (columna 4 = índice 3)
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][3] && rows[i][3].toString().toLowerCase() === data.email.toLowerCase()) {
      return { success: false, error: 'El correo electrónico ya está registrado.' };
    }
  }

  var userId = 'usr_' + Date.now();
  sheet.appendRow([
    userId,
    data.name || '',
    data.lastName || '',
    data.email,
    data.password,
    data.whatsapp || '',
    new Date().toISOString()
  ]);

  return {
    success: true,
    user: { id: userId, name: data.name, lastName: data.lastName, email: data.email, whatsapp: data.whatsapp || '' }
  };
}

// ─── LOGIN DE USUARIO ───
function loginUser(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) return { success: false, error: 'La pestaña "Usuarios" no existe. Ejecuta inicializarTablas() primero.' };

  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    var rowEmail = rows[i][3] ? rows[i][3].toString().toLowerCase() : '';
    var rowPass = rows[i][4] ? rows[i][4].toString() : '';

    if (rowEmail === data.email.toLowerCase() && rowPass === data.password) {
      return {
        success: true,
        user: { id: rows[i][0], name: rows[i][1], lastName: rows[i][2], email: rows[i][3], whatsapp: rows[i][5] || '' }
      };
    }
  }

  return { success: false, error: 'Correo o contraseña incorrectos.' };
}

// ─── GUARDAR / ACTUALIZAR DEDICATORIA ───
// Relación: UserEmail en Dedicatorias → Email en Usuarios
function saveDedication(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dedicatorias');
  if (!sheet) return { success: false, error: 'La pestaña "Dedicatorias" no existe. Ejecuta inicializarTablas() primero.' };

  var rows = sheet.getDataRange().getValues();

  // Buscar si el slug ya existe para actualizar
  var foundRow = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] && rows[i][1].toString().toLowerCase() === data.slug.toLowerCase()) {
      foundRow = i + 1; // 1-indexed para getRange
      break;
    }
  }

  var jsonString = JSON.stringify(data);
  var now = new Date().toISOString();

  if (foundRow > 0) {
    // Actualizar registro existente
    sheet.getRange(foundRow, 3).setValue(data.userEmail || '');
    sheet.getRange(foundRow, 4).setValue(data.partnerName || '');
    sheet.getRange(foundRow, 5).setValue(data.senderName || '');
    sheet.getRange(foundRow, 6).setValue(data.title || '');
    sheet.getRange(foundRow, 7).setValue(jsonString);
    sheet.getRange(foundRow, 8).setValue(now);
  } else {
    // Insertar nuevo registro
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

// ─── OBTENER DEDICATORIA POR SLUG ───
function getDedication(slug) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dedicatorias');
  if (!sheet) return { success: false, error: 'La pestaña "Dedicatorias" no existe.' };

  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] && rows[i][1].toString().toLowerCase() === slug.toLowerCase()) {
      try {
        var jsonData = JSON.parse(rows[i][6]);
        return { success: true, data: jsonData };
      } catch (e) {
        return { success: false, error: 'Error al procesar los datos de la dedicatoria.' };
      }
    }
  }

  return { success: false, error: 'Dedicatoria no encontrada.' };
}

// ─── OBTENER TODAS LAS DEDICATORIAS DE UN USUARIO ───
// Relación: filtra por UserEmail (columna 3 = índice 2)
function getUserDedications(email) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dedicatorias');
  if (!sheet) return { success: true, dedications: [] };

  var rows = sheet.getDataRange().getValues();
  var list = [];

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] && rows[i][2].toString().toLowerCase() === email.toLowerCase()) {
      try {
        list.push(JSON.parse(rows[i][6]));
      } catch (e) {}
    }
  }

  return { success: true, dedications: list };
}

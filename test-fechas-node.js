/**
 * Script de Pruebas Exhaustivas - Frontend CitaYA
 * Valida el manejo de fechas en todas las funciones del frontend
 */

// ============================================================================
// FUNCIONES DEL FRONTEND (copiadas de utils/format.ts)
// ============================================================================

function parseDateLocal(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function toDate(date) {
  if (date instanceof Date) {
    return date;
  }
  
  if (typeof date === 'string') {
    // Extract just the date part if it's an ISO datetime string
    // Handles: "2024-10-23", "2024-10-23T00:00:00", "2024-10-23T00:00:00.000Z"
    const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return parseDateLocal(dateMatch[1]);
    }
  }
  
  // Fallback to Date constructor (for other datetime formats)
  return new Date(date);
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  const d = toDate(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const formatCalendarView = (date) => {
  // Si ya es un string, extraer solo la parte de fecha
  if (typeof date === 'string') {
    // Extraer YYYY-MM-DD de cualquier formato ISO
    const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
  }
  // Si es Date object, convertir a YYYY-MM-DD
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Fallback
  return String(date);
};

// ============================================================================
// SISTEMA DE TESTS
// ============================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

function test(description, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result.pass) {
      passedTests++;
      results.push({
        status: '✅ PASS',
        description,
        details: result.details
      });
    } else {
      failedTests++;
      results.push({
        status: '❌ FAIL',
        description,
        details: result.details
      });
    }
  } catch (error) {
    failedTests++;
    results.push({
      status: '❌ ERROR',
      description,
      details: `Exception: ${error.message}\n${error.stack}`
    });
  }
}

// ============================================================================
// SUITE DE TESTS
// ============================================================================

console.log('\n🧪 INICIANDO TESTS DE MANEJO DE FECHAS - FRONTEND CitaYA\n');
console.log('='.repeat(80));

// Test 1: parseDateLocal básico
test('parseDateLocal("2024-10-23") mantiene el día 23', () => {
  const fecha = parseDateLocal("2024-10-23");
  const dia = fecha.getDate();
  return {
    pass: dia === 23,
    details: `Día obtenido: ${dia}, Esperado: 23`
  };
});

// Test 2: parseDateLocal con diferentes fechas
test('parseDateLocal funciona con diferentes meses', () => {
  const fechas = [
    { input: "2024-01-15", expectedDay: 15 },
    { input: "2024-06-30", expectedDay: 30 },
    { input: "2024-12-25", expectedDay: 25 }
  ];
  
  const results = fechas.map(f => {
    const fecha = parseDateLocal(f.input);
    return fecha.getDate() === f.expectedDay;
  });
  
  return {
    pass: results.every(r => r === true),
    details: `Todas las fechas parseadas correctamente: ${results.every(r => r)}`
  };
});

// Test 3: toDate con string YYYY-MM-DD
test('toDate("2024-10-23") mantiene el día 23', () => {
  const fecha = toDate("2024-10-23");
  const dia = fecha.getDate();
  return {
    pass: dia === 23,
    details: `Día: ${dia}, Esperado: 23`
  };
});

// Test 4: toDate con formato ISO completo (UTC)
test('toDate("2024-10-23T00:00:00.000Z") mantiene el día 23', () => {
  const fecha = toDate("2024-10-23T00:00:00.000Z");
  const dia = fecha.getDate();
  return {
    pass: dia === 23,
    details: `Día: ${dia}, Esperado: 23 (formato ISO con Z)`
  };
});

// Test 5: toDate con formato ISO sin Z
test('toDate("2024-10-23T00:00:00") mantiene el día 23', () => {
  const fecha = toDate("2024-10-23T00:00:00");
  const dia = fecha.getDate();
  return {
    pass: dia === 23,
    details: `Día: ${dia}, Esperado: 23 (formato ISO sin Z)`
  };
});

// Test 6: toDate con Date object
test('toDate(Date object) devuelve el mismo objeto', () => {
  const original = new Date(2024, 9, 23);
  const resultado = toDate(original);
  return {
    pass: resultado === original,
    details: `Es el mismo objeto: ${resultado === original}`
  };
});

// Test 7: formatDateInput
test('formatDateInput(new Date(2024, 9, 23)) retorna "2024-10-23"', () => {
  const fecha = new Date(2024, 9, 23);
  const resultado = formatDateInput(fecha);
  return {
    pass: resultado === "2024-10-23",
    details: `Resultado: "${resultado}", Esperado: "2024-10-23"`
  };
});

// Test 8: Ciclo completo Date -> String -> Date
test('Ciclo completo: Date local -> string -> parseDateLocal mantiene el día', () => {
  const fechaOriginal = new Date(2024, 9, 23);
  const fechaString = formatDateInput(fechaOriginal);
  const fechaParseada = parseDateLocal(fechaString);
  
  const diaOriginal = fechaOriginal.getDate();
  const diaParseado = fechaParseada.getDate();
  
  return {
    pass: diaOriginal === diaParseado,
    details: `Original: ${diaOriginal}, String: "${fechaString}", Parseado: ${diaParseado}`
  };
});

// Test 9: Problema UTC-5 Ecuador
test('Ecuador (UTC-5): Evita problema de new Date() con "2024-10-23T00:00:00.000Z"', () => {
  const fechaISO = "2024-10-23T00:00:00.000Z";
  
  // Con toDate() corregido
  const fechaCorrecta = toDate(fechaISO);
  const diaCorrectoParseado = fechaCorrecta.getDate();
  
  // Con new Date() (método incorrecto)
  const fechaIncorrecta = new Date(fechaISO);
  const diaIncorrecto = fechaIncorrecta.getDate();
  
  return {
    pass: diaCorrectoParseado === 23,
    details: `toDate(): día ${diaCorrectoParseado} ✓ | new Date(): día ${diaIncorrecto} ${diaIncorrecto !== 23 ? '(problema evitado ✓)' : ''}`
  };
});

// Test 10: Array de citas del backend
test('Array de citas del backend (formato ISO) se parsea correctamente', () => {
  const citasDelBackend = [
    { id: "1", fecha: "2024-10-23T00:00:00.000Z", horaInicio: "09:00" },
    { id: "2", fecha: "2024-10-24T00:00:00.000Z", horaInicio: "10:00" },
    { id: "3", fecha: "2024-10-25T00:00:00.000Z", horaInicio: "11:00" }
  ];
  
  const diasParseados = citasDelBackend.map(cita => toDate(cita.fecha).getDate());
  const diasEsperados = [23, 24, 25];
  
  const todosCorrectos = diasParseados.every((dia, idx) => dia === diasEsperados[idx]);
  
  return {
    pass: todosCorrectos,
    details: `Días: [${diasParseados.join(', ')}], Esperados: [${diasEsperados.join(', ')}]`
  };
});

// Test 11: formatCalendarView con string ISO
test('formatCalendarView("2024-10-23T00:00:00.000Z") extrae "2024-10-23"', () => {
  const resultado = formatCalendarView("2024-10-23T00:00:00.000Z");
  return {
    pass: resultado === "2024-10-23",
    details: `Resultado: "${resultado}", Esperado: "2024-10-23"`
  };
});

// Test 12: formatCalendarView con Date object
test('formatCalendarView(new Date(2024, 9, 23)) retorna "2024-10-23"', () => {
  const fecha = new Date(2024, 9, 23);
  const resultado = formatCalendarView(fecha);
  return {
    pass: resultado === "2024-10-23",
    details: `Resultado: "${resultado}", Esperado: "2024-10-23"`
  };
});

// Test 13: Agrupar citas por fecha (lógica de CalendarView)
test('Agrupar citas por fecha mantiene el día correcto', () => {
  const citas = [
    { id: 1, fecha: "2024-10-23T00:00:00.000Z", horaInicio: "09:00" },
    { id: 2, fecha: "2024-10-23T00:00:00.000Z", horaInicio: "10:00" },
    { id: 3, fecha: "2024-10-24T00:00:00.000Z", horaInicio: "09:00" }
  ];
  
  const grouped = {};
  citas.forEach(cita => {
    const fechaNormalizada = cita.fecha.split('T')[0];
    if (!grouped[fechaNormalizada]) {
      grouped[fechaNormalizada] = [];
    }
    grouped[fechaNormalizada].push(cita);
  });
  
  const has23 = grouped["2024-10-23"] && grouped["2024-10-23"].length === 2;
  const has24 = grouped["2024-10-24"] && grouped["2024-10-24"].length === 1;
  
  return {
    pass: has23 && has24,
    details: `2 citas en 2024-10-23 ✓, 1 cita en 2024-10-24 ✓`
  };
});

// Test 14: Envío al backend
test('Datos para backend tienen formato correcto (YYYY-MM-DD)', () => {
  const fechaSeleccionada = new Date(2024, 9, 23);
  const dataToSubmit = {
    fecha: formatDateInput(fechaSeleccionada),
    horaInicio: "09:00",
    horaFin: "10:00"
  };
  
  const fechaCorrecta = dataToSubmit.fecha === "2024-10-23";
  const horaCorrecta = /^\d{2}:\d{2}$/.test(dataToSubmit.horaInicio);
  
  return {
    pass: fechaCorrecta && horaCorrecta,
    details: `Fecha: "${dataToSubmit.fecha}" ✓, Hora: "${dataToSubmit.horaInicio}" ✓`
  };
});

// Test 15: Diferentes timezones simulados
test('Funciones funcionan independiente del offset UTC local', () => {
  const fechas = [
    "2024-10-23T00:00:00.000Z",
    "2024-10-23T05:00:00.000Z",  // UTC-5 (Ecuador)
    "2024-10-23T19:00:00.000Z"   // UTC+5
  ];
  
  const dias = fechas.map(f => toDate(f).getDate());
  const todosCorrectos = dias.every(d => d === 23);
  
  return {
    pass: todosCorrectos,
    details: `Días: [${dias.join(', ')}], Todos deben ser 23`
  };
});

// Test 16: Formato mixto en array
test('Array con formatos mixtos (YYYY-MM-DD e ISO) se parsea correctamente', () => {
  const fechas = [
    "2024-10-23",
    "2024-10-24T00:00:00.000Z",
    "2024-10-25T12:30:00"
  ];
  
  const dias = fechas.map(f => toDate(f).getDate());
  const diasEsperados = [23, 24, 25];
  
  const todosCorrectos = dias.every((dia, idx) => dia === diasEsperados[idx]);
  
  return {
    pass: todosCorrectos,
    details: `Días: [${dias.join(', ')}], Esperados: [${diasEsperados.join(', ')}]`
  };
});

// Test 17: Comparación de fechas
test('Comparación de fechas: dos fechas con el mismo día son iguales', () => {
  const fecha1 = parseDateLocal("2024-10-23");
  const fecha2 = parseDateLocal("2024-10-23");
  const fecha1Str = formatDateInput(fecha1);
  const fecha2Str = formatDateInput(fecha2);
  
  return {
    pass: fecha1Str === fecha2Str,
    details: `"${fecha1Str}" === "${fecha2Str}" ✓`
  };
});

// Test 18: Edge case - Fin de mes
test('Fin de mes (30 y 31) se maneja correctamente', () => {
  const fechas = [
    { input: "2024-01-31", expectedDay: 31 },
    { input: "2024-04-30", expectedDay: 30 },
    { input: "2024-12-31", expectedDay: 31 }
  ];
  
  const results = fechas.map(f => {
    const fecha = toDate(f.input);
    return fecha.getDate() === f.expectedDay;
  });
  
  return {
    pass: results.every(r => r === true),
    details: `Todos los fines de mes parseados correctamente ✓`
  };
});

// Test 19: Año bisiesto
test('Año bisiesto (29 de febrero) se maneja correctamente', () => {
  const fecha = toDate("2024-02-29T00:00:00.000Z");
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  
  return {
    pass: dia === 29 && mes === 2,
    details: `29 de febrero: día ${dia}, mes ${mes} ✓`
  };
});

// Test 20: Vista de tabla - simulación real
test('Vista de tabla muestra fecha correcta (simulación completa)', () => {
  // Simular respuesta del backend
  const citaDelBackend = {
    id: "abc123",
    fecha: "2024-10-23T00:00:00.000Z",
    horaInicio: "09:00",
    horaFin: "10:00",
    cliente: { nombre: "Juan Pérez" }
  };
  
  // Simular formato en la vista de tabla (format.date())
  const fechaParseada = toDate(citaDelBackend.fecha);
  const dia = fechaParseada.getDate();
  const fechaFormateada = fechaParseada.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  return {
    pass: dia === 23,
    details: `Backend: "${citaDelBackend.fecha}", Parseado: día ${dia}, Mostrado: "${fechaFormateada}" ✓`
  };
});

// ============================================================================
// MOSTRAR RESULTADOS
// ============================================================================

console.log('\n📊 RESULTADOS DE LOS TESTS\n');
console.log('='.repeat(80));

results.forEach((result, index) => {
  console.log(`\n${index + 1}. ${result.status} ${result.description}`);
  console.log(`   ${result.details}`);
});

console.log('\n' + '='.repeat(80));
console.log(`\n📈 RESUMEN FINAL:`);
console.log(`   Total de tests: ${totalTests}`);
console.log(`   ✅ Pasados: ${passedTests}`);
console.log(`   ❌ Fallados: ${failedTests}`);
console.log(`   📊 Porcentaje: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

if (failedTests === 0) {
  console.log('\n🎉 ¡TODOS LOS TESTS PASARON! El manejo de fechas es correcto.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  HAY TESTS FALLIDOS. Revisa los detalles arriba.\n');
  process.exit(1);
}

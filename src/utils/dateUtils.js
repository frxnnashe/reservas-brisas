export const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  /**
   * Obtiene la cantidad de días en un mes específico de un año específico
   * @param {string} monthName - Nombre del mes (ej: "Julio")
   * @param {number} year - Año (ej: 2027)
   * @returns {number} Número de días en el mes
   */
  export const getDaysInMonth = (monthName, year) => {
    const monthIndex = MESES.indexOf(monthName);
    
    if (monthIndex === -1) {
      console.warn(`getDaysInMonth: Mes no válido: ${monthName}`);
      return 31; // fallback
    }
    
    // Crear fecha del último día del mes usando Date constructor
    // Date(year, month, 0) nos da el último día del mes anterior
    // por eso usamos monthIndex + 1 para obtener el último día del mes actual
    const lastDay = new Date(year, monthIndex + 1, 0);
    const days = lastDay.getDate();
    
    // Debug para verificar cálculos, especialmente años bisiestos
    if (monthName === "Febrero") {
      console.log(`getDaysInMonth: ${monthName} ${year} tiene ${days} días (${isLeapYear(year) ? 'año bisiesto' : 'año normal'})`);
    } else {
      console.log(`getDaysInMonth: ${monthName} ${year} tiene ${days} días`);
    }
    
    return days;
  };
  
  /**
   * Verifica si un año es bisiesto
   * @param {number} year - Año a verificar
   * @returns {boolean} true si es año bisiesto
   */
  export const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };
  
  /**
   * Obtiene el primer día de la semana de un mes específico
   * @param {string} monthName - Nombre del mes
   * @param {number} year - Año
   * @returns {number} Día de la semana (0 = Domingo, 1 = Lunes, etc.)
   */
  export const getFirstDayOfWeek = (monthName, year) => {
    const monthIndex = MESES.indexOf(monthName);
    
    if (monthIndex === -1) {
      console.warn(`getFirstDayOfWeek: Mes no válido: ${monthName}`);
      return 0; // fallback
    }
    
    // Asegurar que creamos la fecha correctamente
    // Usar UTC para evitar problemas de zona horaria
    const date = new Date(year, monthIndex, 1);
    const firstDay = date.getDay();
    
    const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    console.log(`getFirstDayOfWeek: ${monthName} ${year} empieza en ${dayNames[firstDay]} (${firstDay})`);
    
    return firstDay;
  };
  
  /**
   * Crea un array de días para mostrar en el calendario, incluyendo espacios vacíos
   * @param {string} monthName - Nombre del mes
   * @param {number} year - Año
   * @returns {Array<number|null>} Array con null para espacios vacíos y números para días
   */
  export const createCalendarDays = (monthName, year) => {
    const daysInMonth = getDaysInMonth(monthName, year);
    const firstDayOfWeek = getFirstDayOfWeek(monthName, year);
    
    const calendarDays = [];
    
    // Agregar espacios vacíos para los días de la semana anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Agregar los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    console.log(`createCalendarDays: ${monthName} ${year} - ${daysInMonth} días, empieza en día ${firstDayOfWeek}, array total: ${calendarDays.length} elementos`);
    console.log('Primeros 10 elementos del array:', calendarDays.slice(0, 10));
    
    return calendarDays;
  };
  
  /**
   * Genera una clave única para almacenamiento basada en planilla, mes y año
   * @param {string} planilla - Nombre de la planilla/propiedad
   * @param {string} monthName - Nombre del mes
   * @param {number} year - Año
   * @returns {string} Clave única
   */
  export const generateStorageKey = (planilla, monthName, year) => {
    const key = `${planilla}_${monthName}_${year}`;
    console.log(`generateStorageKey: generando clave -> ${key}`);
    return key;
  };
  
  /**
   * Genera una clave única para gastos basada en mes y año
   * @param {string} monthName - Nombre del mes
   * @param {number} year - Año
   * @returns {string} Clave única para gastos
   */
  export const generateGastosKey = (monthName, year) => {
    return `${monthName}_${year}`;
  };
  
  /**
   * Valida que un día esté dentro del rango válido para un mes/año
   * @param {number} day - Día a validar
   * @param {string} monthName - Nombre del mes
   * @param {number} year - Año
   * @returns {boolean} true si el día es válido
   */
  export const isValidDay = (day, monthName, year) => {
    if (!Number.isInteger(day) || day < 1) {
      return false;
    }
    
    const daysInMonth = getDaysInMonth(monthName, year);
    const isValid = day <= daysInMonth;
    
    console.log(`isValidDay: día ${day} en ${monthName} ${year} (máx: ${daysInMonth}) -> ${isValid}`);
    
    return isValid;
  };
  
  /**
   * Obtiene información formateada del mes actual
   * @param {string} monthName - Nombre del mes
   * @param {number} year - Año
   * @returns {object} Información del mes
   */
  export const getMonthInfo = (monthName, year) => {
    const info = {
      name: monthName,
      year: year,
      daysInMonth: getDaysInMonth(monthName, year),
      firstDayOfWeek: getFirstDayOfWeek(monthName, year),
      displayName: `${monthName} ${year}`,
      isLeapYear: isLeapYear(year)
    };
    
    console.log(`getMonthInfo:`, info);
    
    return info;
  };
  
  /**
   * Función de debugging para verificar el comportamiento del calendario
   * @param {string} monthName - Nombre del mes
   * @param {number} year - Año
   */
  export const debugCalendar = (monthName, year) => {
    console.group(`🗓️  DEBUG CALENDARIO: ${monthName} ${year}`);
    
    const monthInfo = getMonthInfo(monthName, year);
    const calendarDays = createCalendarDays(monthName, year);
    
    console.log('📊 Información del mes:', monthInfo);
    console.log('📅 Array de días del calendario:', calendarDays);
    console.log('🔢 Total de elementos en el calendario:', calendarDays.length);
    console.log('🚫 Espacios vacíos al inicio:', calendarDays.filter(day => day === null).length);
    console.log('📋 Días del mes:', calendarDays.filter(day => day !== null));
    
    // Verificar si febrero tiene los días correctos en años bisiestos
    if (monthName === "Febrero") {
      console.log(`🔍 Febrero ${year}: ${monthInfo.daysInMonth} días (${monthInfo.isLeapYear ? '🎯 BISIESTO' : '📅 normal'})`);
    }
    
    console.groupEnd();
  };
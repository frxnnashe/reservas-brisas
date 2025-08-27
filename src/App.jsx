import React, { useEffect, useState } from 'react';
import Calendar from "./components/Calendar";
import ListaClientes from "./components/ListaClientes";
import ResumenMensual from "./components/ResumenMensual";
import VistaMensual from "./components/VistaMensual";
import { loadData, saveData } from './data/localStorageUtils';

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function App() {
  const [planillasData, setPlanillasData] = useState({});
  const [gastosMensuales, setGastosMensuales] = useState({});
  
  // Estado para mes y año separados
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MESES[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Migración de datos existentes (una sola vez)
  useEffect(() => {
    const shouldMigrate = !localStorage.getItem('migrated_to_year_keys');
    
    if (shouldMigrate) {
      console.log('Migrando datos existentes para incluir años...');
      
      const calendarData = loadData("calendarData", {});
      const gastosData = loadData("gastosMensuales", {});
      
      // Migrar datos de calendario
      const migratedCalendarData = {};
      Object.entries(calendarData).forEach(([key, value]) => {
        if (!key.includes('_2024') && !key.includes('_2025') && !key.includes('_2026') && !key.includes('_2023')) {
          // Es un dato viejo sin año - asumir que son del año actual o anterior
          const newKey = `${key}_2024`; // Asumir que datos existentes son de 2024
          migratedCalendarData[newKey] = value;
        } else {
          migratedCalendarData[key] = value;
        }
      });
      
      // Migrar gastos
      const migratedGastos = {};
      Object.entries(gastosData).forEach(([mes, gastos]) => {
        if (!mes.includes('_2024') && !mes.includes('_2025') && !mes.includes('_2026') && !mes.includes('_2023')) {
          const newKey = `${mes}_2024`;
          migratedGastos[newKey] = gastos;
        } else {
          migratedGastos[mes] = gastos;
        }
      });
      
      // Guardar datos migrados
      saveData("calendarData", migratedCalendarData);
      saveData("gastosMensuales", migratedGastos);
      localStorage.setItem('migrated_to_year_keys', 'true');
      
      console.log('Migración completada exitosamente');
      
      // Actualizar estados con datos migrados
      setPlanillasData(migratedCalendarData);
      setGastosMensuales(migratedGastos);
    } else {
      // Cargar datos normalmente si ya están migrados
      const calendarData = loadData("calendarData", {});
      setPlanillasData(calendarData);
      const gastosData = loadData("gastosMensuales", {});
      setGastosMensuales(gastosData);
    }
  }, []);

  // Función para actualizar los datos de planillas
  const updatePlanillasData = (newData) => {
    setPlanillasData(newData);
    saveData("calendarData", newData);
  };

  // Función para actualizar los gastos
  const updateGastosMensuales = (newData) => {
    setGastosMensuales(newData);
    saveData("gastosMensuales", newData);
  };

  // SIMPLIFICAR: usar directamente selectedYear en lugar de lógica compleja
  const displayYear = selectedYear;

  // Generar años disponibles (2 años atrás, año actual, 2 años adelante)
  const availableYears = [];
  for (let i = currentDate.getFullYear() - 2; i <= currentDate.getFullYear() + 2; i++) {
    availableYears.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Calendario de Reservas</h1>

      {/* Selector de mes y año */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="mes-selector" className="block text-lg font-medium text-gray-700 mb-2">
              Seleccionar Mes:
            </label>
            <select
              id="mes-selector"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 rounded w-full"
            >
              {MESES.map((mes) => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="year-selector" className="block text-lg font-medium text-gray-700 mb-2">
              Año:
            </label>
            <select
              id="year-selector"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border p-2 rounded w-full"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            Viendo: {selectedMonth} {displayYear}
          </p>
        </div>
      </div>

      {/* Componentes con displayYear como prop */}
      <Calendar
        planillasData={planillasData}
        updatePlanillasData={updatePlanillasData}
        selectedMonth={selectedMonth}
        displayYear={displayYear}
        MESES={MESES}
      />
      
      <hr className="my-6" />
      
      <VistaMensual
        planillasData={planillasData}
        selectedMonth={selectedMonth}
        displayYear={displayYear}
        MESES={MESES}
      />
      
      <ListaClientes
        planillasData={planillasData}
        updatePlanillasData={updatePlanillasData}
        selectedMonth={selectedMonth}
        displayYear={displayYear}
        MESES={MESES}
      />
      
      <ResumenMensual
        planillasData={planillasData}
        gastosMensuales={gastosMensuales}
        updateGastosMensuales={updateGastosMensuales}
        selectedMonth={selectedMonth}
        displayYear={displayYear}
        MESES={MESES}
      />
    </div>
  );
}

export default App;
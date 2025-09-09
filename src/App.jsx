import React, { useEffect, useState } from "react";
import Calendar from "./components/Calendar";
import ListaClientes from "./components/ListaClientes";
import ResumenMensual from "./components/ResumenMensual";
import VistaMensual from "./components/VistaMensual";
import { loadData, saveData } from "./data/localStorageUtils";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function App() {
  const [planillasData, setPlanillasData] = useState({});
  const [gastosMensuales, setGastosMensuales] = useState({});

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MESES[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const shouldMigrate = !localStorage.getItem("migrated_to_year_keys_v2");

    if (shouldMigrate) {
      console.log("Migrando datos existentes para incluir años...");

      const calendarData = loadData("calendarData", {});
      const gastosData = loadData("gastosMensuales", {});

      const migratedCalendarData = {};
      Object.entries(calendarData).forEach(([key, value]) => {
        const hasYear = /\d{4}$/.test(key); // Detecta si termina en _YYYY
        if (!hasYear) {
          const newKey = `${key}_${currentDate.getFullYear()}`;
          migratedCalendarData[newKey] = value;
        } else {
          migratedCalendarData[key] = value;
        }
      });

      const migratedGastos = {};
      Object.entries(gastosData).forEach(([mes, gastos]) => {
        const hasYear = /\d{4}$/.test(mes);
        if (!hasYear) {
          const newKey = `${mes}_${currentDate.getFullYear()}`;
          migratedGastos[newKey] = gastos;
        } else {
          migratedGastos[mes] = gastos;
        }
      });

      saveData("calendarData", migratedCalendarData);
      saveData("gastosMensuales", migratedGastos);
      localStorage.setItem("migrated_to_year_keys_v2", "true");

      setPlanillasData(migratedCalendarData);
      setGastosMensuales(migratedGastos);
    } else {
      const calendarData = loadData("calendarData", {});
      setPlanillasData(calendarData);
      const gastosData = loadData("gastosMensuales", {});
      setGastosMensuales(gastosData);
    }
  }, []);

  const updatePlanillasData = (newData) => {
    setPlanillasData(newData);
    saveData("calendarData", newData);
  };

  const updateGastosMensuales = (newData) => {
    setGastosMensuales(newData);
    saveData("gastosMensuales", newData);
  };

  const displayYear = selectedYear;

  const availableYears = [];
  for (let i = currentDate.getFullYear() - 2; i <= 2035; i++) {
    availableYears.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Calendario de Reservas y Gastos</h1>
      <h2 className="text-2xl font-bold mb-4">Brisas Del Sol</h2>

      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-lg font-medium text-gray-700 mb-2">Mes:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border p-2 rounded w-full">
              {MESES.map((mes) => <option key={mes} value={mes}>{mes}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-lg font-medium text-gray-700 mb-2">Año:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="border p-2 rounded w-full">
              {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">Viendo: {selectedMonth} {displayYear}</p>
        </div>
      </div>

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
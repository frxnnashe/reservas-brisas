// App.jsx
import React, { useEffect, useState } from 'react'; // Importa React, useEffect y useState
import Calendar from "./components/Calendar";
import ListaClientes from "./components/ListaClientes";
import ResumenMensual from "./components/ResumenMensual";
import VistaMensual from "./components/VistaMensual";
import { loadData, saveData } from './data/localStorageUtils'; // Importa tus utilidades de localStorage

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function App() {
  const [planillasData, setPlanillasData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(MESES[new Date().getMonth()]);
  // Agrega el estado para gastos si ResumenMensual es el único que lo usa,
  // o eleva también el estado de gastosMensuales si otros componentes lo necesitan
  const [gastosMensuales, setGastosMensuales] = useState({});


  // Cargar todos los datos del localStorage al inicio una sola vez en el componente padre
  useEffect(() => {
    const calendarData = loadData("calendarData", {});
    setPlanillasData(calendarData);
    const gastosData = loadData("gastosMensuales", {});
    setGastosMensuales(gastosData);
  }, []);

  // Función para actualizar los datos de planillas y guardarlos en localStorage
  const updatePlanillasData = (newData) => {
    setPlanillasData(newData); // Actualiza el estado de React
    saveData("calendarData", newData); // Guarda en localStorage
  };

  // Función para actualizar los datos de gastos y guardarlos en localStorage
  const updateGastosMensuales = (newData) => {
    setGastosMensuales(newData); // Actualiza el estado de React
    saveData("gastosMensuales", newData); // Guarda en localStorage
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Calendario de Reservas</h1>

      {/* Selector de mes global si todos los componentes deben reaccionar al mismo mes */}
      <div className="max-w-3xl mx-auto mb-6">
        <label htmlFor="mes-selector" className="block text-lg font-medium text-gray-700 mb-2">
          Seleccionar Mes:
        </label>
        <select
          id="mes-selector"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        >
          {MESES.map((mes) => (
            <option key={mes} value={mes}>{mes}</option>
          ))}
        </select>
      </div>


      {/* Pasa los datos y funciones de actualización a los componentes hijos */}
      <Calendar
        planillasData={planillasData}
        updatePlanillasData={updatePlanillasData}
        selectedMonth={selectedMonth}
        MESES={MESES} // Pasa MESES si Calendar lo necesita de forma global
      />
      <hr className="my-6" />
      <VistaMensual
        planillasData={planillasData}
        selectedMonth={selectedMonth}
        MESES={MESES}
      />
      <ListaClientes
        planillasData={planillasData}
        updatePlanillasData={updatePlanillasData}
        selectedMonth={selectedMonth}
        MESES={MESES}
      />
      <ResumenMensual
        planillasData={planillasData}
        gastosMensuales={gastosMensuales}
        updateGastosMensuales={updateGastosMensuales}
        selectedMonth={selectedMonth}
        MESES={MESES}
      />
    </div>
  );
}

export default App;
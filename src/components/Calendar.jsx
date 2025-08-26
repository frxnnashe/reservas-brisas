import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Home } from "lucide-react";

const PLANILLAS = ["Depto 1", "Depto 2", "Depto 3", "Depto 4", "Casa"];
const COLORS = [
  "bg-emerald-400", "bg-blue-400", "bg-violet-400", "bg-pink-400",
  "bg-amber-400", "bg-orange-400", "bg-red-400", "bg-teal-400"
];

const getClientColor = (name) => {
  if (typeof name !== "string") return "";
  const index = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
  return COLORS[index];
};

// Función para obtener la cantidad de días en un mes específico
const getDaysInMonth = (monthName, year = new Date().getFullYear()) => {
  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const monthIndex = MESES.indexOf(monthName);
  if (monthIndex === -1) return 31;
  
  return new Date(year, monthIndex + 1, 0).getDate();
};

export default function Calendar({ planillasData, updatePlanillasData, selectedMonth, MESES }) {
  const [selectedPlanilla, setSelectedPlanilla] = useState(PLANILLAS[0]);
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [cliente, setCliente] = useState("");

  const currentKey = `${selectedPlanilla}_${selectedMonth}`;
  const currentData = planillasData[currentKey] || {};
  const daysInMonth = getDaysInMonth(selectedMonth);

  const handleAgendar = () => {
    const start = parseInt(entrada, 10);
    const end = parseInt(salida, 10);
    
    if (isNaN(start) || isNaN(end) || !cliente.trim()) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    if (start < 1 || end > daysInMonth || start > end) {
      alert(`Los días deben estar entre 1 y ${daysInMonth} para ${selectedMonth}.`);
      return;
    }

    // Validar días ocupados
    const diasOcupados = [];
    for (let i = start; i <= end; i++) {
      if (currentData[i]?.cliente) {
        diasOcupados.push({
          dia: i,
          cliente: currentData[i].cliente
        });
      }
    }

    if (diasOcupados.length > 0) {
      const listaOcupados = diasOcupados
        .map(item => `Día ${item.dia} (${item.cliente})`)
        .join(', ');
      
      alert(`❌ No se puede agendar la reserva.\n\nLos siguientes días ya están ocupados:\n${listaOcupados}\n\nPor favor selecciona otros días o libera estas fechas primero.`);
      return;
    }

    const color = getClientColor(cliente);
    const updatedPlanilla = { ...currentData };
    for (let i = start; i <= end; i++) {
      updatedPlanilla[i] = { cliente: cliente.trim(), color };
    }

    const updatedGlobalData = {
      ...planillasData,
      [currentKey]: updatedPlanilla,
    };

    updatePlanillasData(updatedGlobalData);

    // Feedback de éxito
    const diasReservados = end - start + 1;
    alert(`✅ ¡Reserva creada exitosamente!\n\nCliente: ${cliente.trim()}\nPropiedad: ${selectedPlanilla}\nDías: ${start} al ${end} (${diasReservados} ${diasReservados === 1 ? 'día' : 'días'})`);

    setCliente("");
    setEntrada("");
    setSalida("");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="p-2 bg-blue-50 rounded-lg">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agendar Reserva</h2>
          <p className="text-sm text-gray-500">
            {selectedMonth} • {daysInMonth} días
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        {/* Selector de Propiedad */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Propiedad
          </label>
          <select
            value={selectedPlanilla}
            onChange={(e) => setSelectedPlanilla(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {PLANILLAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Check-in
            </label>
            <input
              type="number"
              placeholder="Día"
              min="1"
              max={daysInMonth}
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Check-out
            </label>
            <input
              type="number"
              placeholder="Día"
              min="1"
              max={daysInMonth}
              value={salida}
              onChange={(e) => setSalida(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center font-medium"
            />
          </div>
        </div>

        {/* Cliente y Botón */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nombre del Cliente
            </label>
            <input
              type="text"
              placeholder="Ingresa el nombre"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <button
            onClick={handleAgendar}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agendar Reserva
          </button>
        </div>
      </div>

      {/* Calendario */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          {selectedPlanilla}
        </h3>
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dia, i) => (
            <div key={i} className="text-center py-2 text-xs font-medium text-gray-500">
              {dia}
            </div>
          ))}
        </div>
        
        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const info = currentData[day];
            const isOccupied = info?.cliente;
            
            return (
              <div
                key={day}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 border-2 relative
                  ${isOccupied 
                    ? `${info.color} border-transparent text-white shadow-md` 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                  }
                `}
                title={info?.cliente || "Libre"}
              >
                <span className="relative z-10">{day}</span>
              </div>
            );
          })}
        </div>
        
        {/* Leyenda */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span>Libre</span>
          </div>
          {Object.values(currentData).reduce((acc, info) => {
            if (info?.cliente && !acc.find(item => item.cliente === info.cliente)) {
              acc.push(info);
            }
            return acc;
          }, []).map((info) => (
            <div key={info.cliente} className="flex items-center gap-2 text-xs text-gray-600">
              <div className={`w-3 h-3 ${info.color} rounded`}></div>
              <span>{info.cliente}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
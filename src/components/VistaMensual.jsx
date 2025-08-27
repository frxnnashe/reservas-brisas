import React from "react";
import {createCalendarDays, generateStorageKey, getMonthInfo } from '../utils/dateUtils';
import { Grid3X3, Eye } from "lucide-react";

const PLANILLAS = ["Depto 1", "Depto 2", "Depto 3", "Depto 4", "Casa"];

const getDaysInMonth = (monthName, year) => {
  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const monthIndex = MESES.indexOf(monthName);
  if (monthIndex === -1) return 31;
  
  return new Date(year, monthIndex + 1, 0).getDate();
};

// Nueva función para obtener el primer día de la semana del mes
const getFirstDayOfWeek = (monthName, year) => {
  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const monthIndex = MESES.indexOf(monthName);
  if (monthIndex === -1) return 0;
  
  // getDay() devuelve 0 para domingo, 1 para lunes, etc.
  return new Date(year, monthIndex, 1).getDay();
};

export default function VistaMensual({ planillasData, selectedMonth, displayYear, MESES }) {
  const daysInMonth = getDaysInMonth(selectedMonth, displayYear);
  const firstDayOfWeek = getFirstDayOfWeek(selectedMonth, displayYear);

  const getDayData = (planilla, day) => {
    // ✅ CORREGIDO: Usar displayYear en lugar de solo selectedMonth
    const key = `${planilla}_${selectedMonth}_${displayYear}`;
    const data = planillasData[key] || {};
    return data[day];
  };

  const COLORS = [
    "bg-emerald-400", "bg-blue-400", "bg-violet-400", "bg-pink-400",
    "bg-amber-400", "bg-orange-400", "bg-red-400", "bg-teal-400"
  ];
  
  const getClientColor = (name) => {
    if (typeof name !== "string") return "";
    const index = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
    return COLORS[index];
  };

  // ✅ CORREGIDO: Calcular estadísticas con displayYear
  const stats = PLANILLAS.reduce((acc, planilla) => {
    const key = `${planilla}_${selectedMonth}_${displayYear}`;
    const data = planillasData[key] || {};
    const ocupados = Object.keys(data).length;
    const porcentaje = ((ocupados / daysInMonth) * 100).toFixed(1);
    
    acc[planilla] = {
      ocupados,
      libres: daysInMonth - ocupados,
      porcentaje: parseFloat(porcentaje)
    };
    return acc;
  }, {});

  // Crear array de días para el calendario con espacios vacíos al inicio
  const createCalendarDays = () => {
    const calendarDays = [];
    
    // Agregar espacios vacíos para los días de la semana anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Agregar los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    return calendarDays;
  };

  const calendarDays = createCalendarDays();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Eye className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vista General</h2>
          <p className="text-sm text-gray-500">
            {selectedMonth} {displayYear} • {daysInMonth} días
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PLANILLAS.map((planilla) => (
          <div key={planilla} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{stats[planilla].porcentaje}%</div>
            <div className="text-xs text-gray-600 font-medium">{planilla}</div>
            <div className="text-xs text-gray-500">
              {stats[planilla].ocupados}/{daysInMonth} días
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats[planilla].porcentaje}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla responsive */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Grid3X3 className="w-4 h-4" />
          <span>Desliza horizontalmente para ver todos los días</span>
        </div>
        
        <div className="overflow-x-auto bg-gray-50 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white">
                <th className="sticky left-0 bg-white px-4 py-3 text-left font-semibold text-gray-900 border-r border-gray-200 min-w-[100px]">
                  Propiedad
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th key={i} className="px-2 py-3 text-center font-medium text-gray-600 min-w-[40px] border-r border-gray-200">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLANILLAS.map((planilla, planillaIndex) => (
                <tr key={planilla} className={`${planillaIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  <td className="sticky left-0 bg-inherit px-4 py-3 font-medium text-gray-900 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {planilla}
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const info = getDayData(planilla, i + 1);
                    const cellColor = info?.cliente ? getClientColor(info.cliente) : "";
                    const isOccupied = info?.cliente;
                    
                    return (
                      <td
                        key={i}
                        className={`px-2 py-3 text-center border-r border-gray-200 ${
                          isOccupied ? `${cellColor} text-white font-medium` : 'text-gray-400'
                        }`}
                        title={info?.cliente || "Libre"}
                      >
                        <div className="text-xs">
                          {info?.cliente ? info.cliente.substring(0, 3).toUpperCase() : "•"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Leyenda de Clientes</h3>
        <div className="space-y-2">
          {(() => {
            const clientesUnicos = new Set();
            PLANILLAS.forEach(planilla => {
              // ✅ CORREGIDO: Usar displayYear en lugar de solo selectedMonth
              const key = `${planilla}_${selectedMonth}_${displayYear}`;
              const data = planillasData[key] || {};
              Object.values(data).forEach(info => {
                if (info?.cliente) clientesUnicos.add(info.cliente);
              });
            });

            return Array.from(clientesUnicos).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Array.from(clientesUnicos).map(cliente => (
                  <div key={cliente} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <div className={`w-3 h-3 ${getClientColor(cliente)} rounded`}></div>
                    <span className="text-sm font-medium text-gray-700">{cliente}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
                  <Grid3X3 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No hay reservas este mes</p>
                <p className="text-sm text-gray-400">Las reservas aparecerán aquí cuando las agregues</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
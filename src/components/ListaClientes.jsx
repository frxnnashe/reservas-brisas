import React, { useState } from "react";
import { Users, Edit3, Trash2, Save, X, MapPin, Calendar, DollarSign } from "lucide-react";

const PLANILLAS = ["Depto 1", "Depto 2", "Depto 3", "Depto 4", "Casa"];

export default function ListaClientes({ planillasData, updatePlanillasData, selectedMonth, MESES }) {
  const [editingClient, setEditingClient] = useState(null);
  const [editEntrada, setEditEntrada] = useState("");
  const [editSalida, setEditSalida] = useState("");
  const [editPlanilla, setEditPlanilla] = useState("");

  const agruparPorCliente = () => {
    const agrupado = {};
    PLANILLAS.forEach((planilla) => {
      const key = `${planilla}_${selectedMonth}`;
      const data = planillasData[key] || {};
      Object.entries(data).forEach(([day, info]) => {
        if (info.cliente) {
          if (!agrupado[info.cliente]) {
            agrupado[info.cliente] = {
              dias: new Set(),
              total: info.total || 0,
              planillas: new Set(),
              firstDay: parseInt(day),
              lastDay: parseInt(day),
              initialPlanilla: planilla,
            };
          }
          agrupado[info.cliente].dias.add(parseInt(day));
          agrupado[info.cliente].planillas.add(planilla);
          agrupado[info.cliente].firstDay = Math.min(agrupado[info.cliente].firstDay, parseInt(day));
          agrupado[info.cliente].lastDay = Math.max(agrupado[info.cliente].lastDay, parseInt(day));
        }
      });
    });
    return agrupado;
  };

  const handleEliminarCliente = (cliente) => {
    if (window.confirm(`¿Eliminar todas las reservas de ${cliente}?`)) {
      const nuevoData = { ...planillasData };
      PLANILLAS.forEach((planilla) => {
        const key = `${planilla}_${selectedMonth}`;
        if (nuevoData[key]) {
          Object.keys(nuevoData[key]).forEach((day) => {
            if (nuevoData[key][day]?.cliente === cliente) {
              delete nuevoData[key][day];
            }
          });
        }
      });
      updatePlanillasData(nuevoData);
      setEditingClient(null);
    }
  };

  const handleMontoChange = (cliente, nuevoMonto) => {
    const nuevoData = { ...planillasData };
    PLANILLAS.forEach((planilla) => {
      const key = `${planilla}_${selectedMonth}`;
      if (nuevoData[key]) {
        Object.keys(nuevoData[key]).forEach((day) => {
          if (nuevoData[key][day]?.cliente === cliente) {
            nuevoData[key][day].total = parseFloat(nuevoMonto) || 0;
          }
        });
      }
    });
    updatePlanillasData(nuevoData);
  };

  const handleEditClick = (cliente, info) => {
    setEditingClient(cliente);
    setEditEntrada(info.firstDay.toString());
    setEditSalida(info.lastDay.toString());
    setEditPlanilla(Array.from(info.planillas)[0] || PLANILLAS[0]);
  };

  const handleGuardarEdicion = (clienteOriginal) => {
    const start = parseInt(editEntrada, 10);
    const end = parseInt(editSalida, 10);
    const targetPlanilla = editPlanilla;

    if (isNaN(start) || isNaN(end) || start > end || !targetPlanilla) {
      alert("Por favor, introduce un rango válido y selecciona una propiedad.");
      return;
    }

    // Validar que los días estén en el rango del mes
    const daysInMonth = new Date(new Date().getFullYear(), MESES.indexOf(selectedMonth) + 1, 0).getDate();
    if (start < 1 || end > daysInMonth) {
      alert(`Los días deben estar entre 1 y ${daysInMonth} para ${selectedMonth}.`);
      return;
    }

    const nuevoData = { ...planillasData };
    let clienteColor = null;

    // Verificar conflictos en la nueva ubicación ANTES de eliminar las reservas existentes
    const newKey = `${targetPlanilla}_${selectedMonth}`;
    const diasOcupados = [];
    
    for (let i = start; i <= end; i++) {
      const existingReservation = nuevoData[newKey]?.[i];
      // Solo es conflicto si hay una reserva Y no es del cliente que estamos editando
      if (existingReservation?.cliente && existingReservation.cliente !== clienteOriginal) {
        diasOcupados.push({
          dia: i,
          cliente: existingReservation.cliente
        });
      }
    }

    if (diasOcupados.length > 0) {
      const listaOcupados = diasOcupados
        .map(item => `Día ${item.dia} (${item.cliente})`)
        .join(', ');
      
      alert(`❌ No se puede mover la reserva.\n\nLos siguientes días ya están ocupados:\n${listaOcupados}\n\nPor favor selecciona otros días disponibles.`);
      return;
    }

    // Eliminar reservas anteriores del cliente y capturar color
    PLANILLAS.forEach((planilla) => {
      const key = `${planilla}_${selectedMonth}`;
      if (nuevoData[key]) {
        Object.keys(nuevoData[key]).forEach((day) => {
          if (nuevoData[key][day]?.cliente === clienteOriginal) {
            if (!clienteColor) {
              clienteColor = nuevoData[key][day].color;
            }
            delete nuevoData[key][day];
          }
        });
      }
    });

    // Asignar color si no existe
    if (!clienteColor) {
      const COLORS = [
        "bg-emerald-400", "bg-blue-400", "bg-violet-400", "bg-pink-400",
        "bg-amber-400", "bg-orange-400", "bg-red-400", "bg-teal-400"
      ];
      const getClientColor = (name) => {
        const index = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
        return COLORS[index];
      };
      clienteColor = getClientColor(clienteOriginal);
    }

    // Crear nuevas reservas
    if (!nuevoData[newKey]) {
      nuevoData[newKey] = {};
    }

    const agrupado = agruparPorCliente();
    const totalOriginal = agrupado[clienteOriginal]?.total || 0;

    for (let i = start; i <= end; i++) {
      nuevoData[newKey][i] = {
        cliente: clienteOriginal,
        color: clienteColor,
        total: totalOriginal,
      };
    }

    updatePlanillasData(nuevoData);

    // Feedback de éxito
    const diasReservados = end - start + 1;
    alert(`✅ Reserva actualizada exitosamente!\n\nCliente: ${clienteOriginal}\nNueva ubicación: ${targetPlanilla}\nDías: ${start} al ${end} (${diasReservados} ${diasReservados === 1 ? 'día' : 'días'})`);

    setEditingClient(null);
    setEditEntrada("");
    setEditSalida("");
    setEditPlanilla("");
  };

  const handleCancelarEdicion = () => {
    setEditingClient(null);
    setEditEntrada("");
    setEditSalida("");
    setEditPlanilla("");
  };

  const agrupado = agruparPorCliente();
  const totalClientes = Object.keys(agrupado).length;
  const ingresoTotal = Object.values(agrupado).reduce((acc, info) => acc + (parseFloat(info.total) || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-green-50 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lista de Clientes</h2>
            <p className="text-sm text-gray-500">{selectedMonth}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalClientes}</div>
            <div className="text-sm text-blue-800">Clientes</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${ingresoTotal.toFixed(0)}</div>
            <div className="text-sm text-green-800">Total</div>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      {Object.entries(agrupado).length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No hay clientes este mes</p>
          <p className="text-sm text-gray-400">Los clientes aparecerán aquí cuando agregues reservas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(agrupado).map(([cliente, info]) => {
            const diasArray = Array.from(info.dias).sort((a, b) => a - b);
            const isEditing = editingClient === cliente;
            
            return (
              <div key={cliente} className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-4 space-y-4">
                {/* Cliente Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900">{cliente}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{diasArray.length} días</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{Array.from(info.planillas).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancelarEdicion}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGuardarEdicion(cliente)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditClick(cliente, info)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminarCliente(cliente)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Días ocupados */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Días reservados:</p>
                  <div className="flex flex-wrap gap-1">
                    {diasArray.map(dia => (
                      <span key={dia} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                        {dia}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Modo edición */}
                {isEditing && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-blue-900">Editar Reserva</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-blue-800 mb-1">Check-in</label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={editEntrada}
                          onChange={(e) => setEditEntrada(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-800 mb-1">Check-out</label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={editSalida}
                          onChange={(e) => setEditSalida(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-800 mb-1">Propiedad</label>
                        <select
                          value={editPlanilla}
                          onChange={(e) => setEditPlanilla(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          {PLANILLAS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monto */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Total pagado:</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={info.total || ""}
                    onChange={(e) => handleMontoChange(cliente, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
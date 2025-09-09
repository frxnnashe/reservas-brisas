import React from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Home,
} from "lucide-react";

// Función centralizada para obtener días en un mes
const getDaysInMonth = (monthName, year) => {
  const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const monthIndex = MESES.indexOf(monthName);
  if (monthIndex === -1) {
    console.warn(`Mes no válido: ${monthName}`);
    return 31;
  }

  // Usar Date constructor con año específico
  const date = new Date(year, monthIndex + 1, 0);
  const days = date.getDate();

  // Debug para verificar cálculos
  console.log(`${monthName} ${year}: ${days} días`);

  return days;
};

const PLANILLAS = [
  "Depto 1",
  "Depto 2",
  "Depto 3",
  "Depto 4",
  "Depto 5",
  "Depto 6",
  "Casa",
];

const GASTOS = [
  { name: "Gas", icon: "🔥" },
  { name: "Luz", icon: "💡" },
  { name: "Agua", icon: "💧" },
  { name: "Cable", icon: "📺" },
  { name: "Municipalidad", icon: "🏛️" },
  { name: "Rentas", icon: "🏠" },
  { name: "Varios", icon: "📦" },
  { name: "Impuestos", icon: "📄" },
  { name: "Jardinero", icon: "🌿" },
  { name: "Empleada", icon: "🧹" },
  { name: "Piletero", icon: "🏊‍♂️" },
  { name: "Marketing", icon: "📈" },
];

export default function ResumenMensual({
  planillasData,
  gastosMensuales,
  updateGastosMensuales,
  selectedMonth,
  displayYear,
  MESES,
}) {
  // ✅ CORREGIDO: Usar displayYear en la clave de gastos
  const gastos = gastosMensuales[`${selectedMonth}_${displayYear}`] || {
    Gas: 0,
    Luz: 0,
    Agua: 0,
    Cable: 0,
    Municipalidad: 0,
    Rentas: 0,
    Varios: 0,
    Impuestos: 0,
    Jardinero: 0,
    Empleada: 0,
    Piletero: 0,
    Marketing: 0,
  };

  const calcularResumen = () => {
    const resumen = {};

    PLANILLAS.forEach((planilla) => {
      const key = `${planilla}_${selectedMonth}_${displayYear}`;
      const datos = planillasData[key] || {};

      const clientes = {};
      Object.entries(datos).forEach(([day, info]) => {
        if (info.cliente && (info.total !== undefined || info.total !== null)) {
          clientes[info.cliente] = info.total;
        }
      });

      const dias = Object.keys(datos).length;
      const ingreso = Object.values(clientes).reduce(
        (acc, monto) => acc + (parseFloat(monto) || 0),
        0
      );

      resumen[planilla] = { dias, ingreso };
    });

    return resumen;
  };

  // ✅ CORREGIDO: Usar displayYear en la clave de actualización
  const handleGastoChange = (nombre, valor) => {
    const nuevoValor = parseFloat(valor) || 0;
    const nuevosGastosMes = { ...gastos, [nombre]: nuevoValor };
    const nuevosGastosPorMes = {
      ...gastosMensuales,
      [`${selectedMonth}_${displayYear}`]: nuevosGastosMes, // Era: [selectedMonth]: nuevosGastosMes
    };
    updateGastosMensuales(nuevosGastosPorMes);
  };

  const resumen = calcularResumen();
  const totalIngresos = Object.values(resumen).reduce(
    (acc, val) => acc + val.ingreso,
    0
  );
  const totalGastos = Object.values(gastos).reduce((acc, val) => acc + val, 0);
  const balanceFinal = totalIngresos - totalGastos;
  const totalDias = Object.values(resumen).reduce(
    (acc, val) => acc + val.dias,
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Resumen Financiero
          </h2>
          <p className="text-sm text-gray-500">
            {selectedMonth} {displayYear}
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">
            ${totalIngresos.toFixed(0)}
          </div>
          <div className="text-sm text-green-600 font-medium">Ingresos</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700">
            ${totalGastos.toFixed(0)}
          </div>
          <div className="text-sm text-red-600 font-medium">Gastos</div>
        </div>

        <div
          className={`bg-gradient-to-br ${
            balanceFinal >= 0
              ? "from-blue-50 to-indigo-100"
              : "from-orange-50 to-amber-100"
          } rounded-lg p-4 text-center`}
        >
          <div className="flex justify-center mb-2">
            <DollarSign
              className={`w-6 h-6 ${
                balanceFinal >= 0 ? "text-blue-600" : "text-orange-600"
              }`}
            />
          </div>
          <div
            className={`text-2xl font-bold ${
              balanceFinal >= 0 ? "text-blue-700" : "text-orange-700"
            }`}
          >
            ${Math.abs(balanceFinal).toFixed(0)}
          </div>
          <div
            className={`text-sm font-medium ${
              balanceFinal >= 0 ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {balanceFinal >= 0 ? "Ganancia" : "Pérdida"}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Home className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">{totalDias}</div>
          <div className="text-sm text-purple-600 font-medium">
            Días ocupados
          </div>
        </div>
      </div>

      {/* Tabla de propiedades */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-gray-600" />
          Ingresos por Propiedad
        </h3>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  Propiedad
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">
                  Días
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">
                  Ingreso
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {PLANILLAS.map((planilla, index) => (
                <tr
                  key={planilla}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {planilla}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {resumen[planilla]?.dias || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${(resumen[planilla]?.ingreso || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gastos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-gray-600" />
          Gastos del Mes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GASTOS.map(({ name, icon }) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <label className="font-medium text-gray-700">{name}</label>
              </div>
              <input
                type="number"
                min={0}
                value={gastos[name] || ""}
                onChange={(e) => handleGastoChange(name, e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-semibold"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Balance final destacado */}
      <div
        className={`rounded-xl p-6 ${
          balanceFinal >= 0
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
        }`}
      >
        <div className="text-center space-y-2">
          <div className="text-sm font-medium opacity-90">
            Balance Final del Mes
          </div>
          <div className="text-4xl font-bold">
            {balanceFinal >= 0 ? "+" : "-"}${Math.abs(balanceFinal).toFixed(2)}
          </div>
          <div className="text-sm opacity-80">
            {balanceFinal >= 0
              ? "Tienes ganancias este mes"
              : "Los gastos superaron los ingresos"}
          </div>
        </div>
      </div>
    </div>
  );
}

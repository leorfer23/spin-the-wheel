import React from 'react';
import type { WheelSchedule as ScheduleType } from './types';

interface WheelScheduleProps {
  schedule: ScheduleType;
  onUpdateSchedule: (schedule: ScheduleType) => void;
}

export const WheelSchedule: React.FC<WheelScheduleProps> = ({
  schedule,
  onUpdateSchedule,
}) => {
  const toggleDay = (day: string) => {
    const days = schedule.days.includes(day)
      ? schedule.days.filter(d => d !== day)
      : [...schedule.days, day];
    onUpdateSchedule({ ...schedule, days });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Horario Activo</h3>
          <p className="text-sm text-gray-500 mt-1">
            Mostrar la rueda solo durante los horarios especificados
          </p>
        </div>
        <button
          onClick={() =>
            onUpdateSchedule({ ...schedule, enabled: !schedule.enabled })
          }
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            schedule.enabled ? 'bg-purple-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
              schedule.enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <p className="text-base font-medium text-gray-900 mb-4">Días Activos</p>
        <div className="grid grid-cols-7 gap-2 max-w-md">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => {
            const fullDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
            const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][index];
            return (
              <button
                key={index}
                onClick={() => toggleDay(fullDay)}
                title={dayName}
                className={`aspect-square rounded-xl text-sm font-medium transition-colors ${
                  schedule.days.includes(fullDay)
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Hora de Inicio</label>
          <input
            type="time"
            value={schedule.startTime}
            onChange={(e) =>
              onUpdateSchedule({ ...schedule, startTime: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Hora de Fin</label>
          <input
            type="time"
            value={schedule.endTime}
            onChange={(e) =>
              onUpdateSchedule({ ...schedule, endTime: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Fecha de Inicio</label>
          <input
            type="date"
            value={schedule.startDate}
            onChange={(e) =>
              onUpdateSchedule({ ...schedule, startDate: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Fecha de Fin</label>
          <input
            type="date"
            value={schedule.endDate}
            onChange={(e) =>
              onUpdateSchedule({ ...schedule, endDate: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};
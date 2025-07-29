import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { WheelScheduleConfig } from '../../types/models';
import { format, addDays } from 'date-fns';

interface SchedulePreviewProps {
  config: WheelScheduleConfig;
  timezone?: string;
}

export const SchedulePreview: React.FC<SchedulePreviewProps> = ({ 
  config, 
  timezone = 'UTC' 
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const upcomingActiveWindows = useMemo(() => {
    if (!config.enabled) return [];

    const windows: { start: Date; end: Date; reason: string }[] = [];
    const now = new Date();
    const nextWeek = addDays(now, 7);

    // For each day in the next week
    for (let d = new Date(now); d <= nextWeek; d = addDays(d, 1)) {
      const dayOfWeek = d.getDay();
      
      // Check if this day is active
      if (config.weekDays?.enabled && !config.weekDays.days.includes(dayOfWeek)) {
        continue;
      }

      // Check special dates
      const dateStr = format(d, 'yyyy-MM-dd');
      if (config.specialDates?.blacklistDates.includes(dateStr)) {
        continue;
      }

      const isWhitelisted = config.specialDates?.whitelistDates.includes(dateStr);

      // Check time slots for this day
      if (config.timeSlots?.enabled && config.timeSlots.slots.length > 0) {
        config.timeSlots.slots.forEach(slot => {
          const start = new Date(d);
          start.setHours(Math.floor(slot.startMinutes / 60));
          start.setMinutes(slot.startMinutes % 60);
          
          const end = new Date(d);
          end.setHours(Math.floor(slot.endMinutes / 60));
          end.setMinutes(slot.endMinutes % 60);

          if (start >= now) {
            windows.push({
              start,
              end,
              reason: isWhitelisted ? 'Special Date' : (slot.label || 'Time Slot')
            });
          }
        });
      } else if (!config.timeSlots?.enabled) {
        // All day active
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);

        if (start >= now) {
          windows.push({
            start,
            end,
            reason: isWhitelisted ? 'Special Date' : 'All Day'
          });
        }
      }
    }

    return windows.slice(0, 5); // Show next 5 windows
  }, [config]);

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vista Previa del Horario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">La rueda está siempre activa</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Preview
        </CardTitle>
        <CardDescription>
          Zona Horaria: {config.timezone || timezone}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Days */}
        {config.weekDays?.enabled && (
          <div>
            <h4 className="text-sm font-medium mb-2">Días Activos</h4>
            <div className="flex gap-1">
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium ${
                    config.weekDays?.days.includes(idx)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Hours */}
        {config.timeSlots?.enabled && config.timeSlots.slots.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Active Hours</h4>
            <div className="space-y-1">
              {config.timeSlots.slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    {formatTime(slot.startMinutes)} - {formatTime(slot.endMinutes)}
                    {slot.label && <span className="text-gray-500 ml-2">({slot.label})</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        {(config.dateRange?.startDate || config.dateRange?.endDate) && (
          <div>
            <h4 className="text-sm font-medium mb-2">Date Range</h4>
            <div className="text-sm text-gray-600">
              {config.dateRange.startDate && (
                <div>Starts: {format(new Date(config.dateRange.startDate), 'PPP')}</div>
              )}
              {config.dateRange.endDate && (
                <div>Ends: {format(new Date(config.dateRange.endDate), 'PPP')}</div>
              )}
            </div>
          </div>
        )}

        {/* Special Dates */}
        {((config.specialDates?.blacklistDates.length || 0) > 0 || 
          (config.specialDates?.whitelistDates.length || 0) > 0) && (
          <div>
            <h4 className="text-sm font-medium mb-2">Special Dates</h4>
            {config.specialDates?.blacklistDates && config.specialDates.blacklistDates.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-gray-500">Excluded:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.specialDates?.blacklistDates?.map(date => (
                    <span key={date} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      {date}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {config.specialDates?.whitelistDates && config.specialDates.whitelistDates.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Always Active:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.specialDates?.whitelistDates?.map(date => (
                    <span key={date} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      {date}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Active Windows */}
        <div>
          <h4 className="text-sm font-medium mb-2">Next Active Windows</h4>
          {upcomingActiveWindows.length > 0 ? (
            <div className="space-y-2">
              {upcomingActiveWindows.map((window, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {format(window.start, 'EEE, MMM d')}
                    </div>
                    <div className="text-gray-600">
                      {format(window.start, 'h:mm a')} - {format(window.end, 'h:mm a')}
                      <span className="text-gray-400 ml-2">({window.reason})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">No active windows in the next 7 days</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
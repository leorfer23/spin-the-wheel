import type { WheelScheduleConfig } from '../types/models';

export const defaultScheduleConfig: WheelScheduleConfig = {
  enabled: false,
  timezone: 'UTC',
  dateRange: {
    startDate: null,
    endDate: null
  },
  timeSlots: {
    enabled: false,
    slots: []
  },
  weekDays: {
    enabled: false,
    days: [0, 1, 2, 3, 4, 5, 6] // All days by default
  },
  specialDates: {
    blacklistDates: [],
    whitelistDates: []
  }
};

export const schedulePresets = {
  businessHours: {
    name: 'Business Hours',
    description: '9 AM - 5 PM, Monday to Friday',
    config: {
      enabled: true,
      timezone: 'UTC',
      weekDays: {
        enabled: true,
        days: [1, 2, 3, 4, 5]
      },
      timeSlots: {
        enabled: true,
        slots: [{
          startMinutes: 540, // 9 AM
          endMinutes: 1020,  // 5 PM
          label: 'Business Hours'
        }]
      }
    }
  },
  happyHour: {
    name: 'Happy Hour',
    description: '4 PM - 7 PM every day',
    config: {
      enabled: true,
      timezone: 'UTC',
      timeSlots: {
        enabled: true,
        slots: [{
          startMinutes: 960,  // 4 PM
          endMinutes: 1140,   // 7 PM
          label: 'Happy Hour'
        }]
      }
    }
  },
  weekendOnly: {
    name: 'Weekends Only',
    description: 'Saturday and Sunday all day',
    config: {
      enabled: true,
      timezone: 'UTC',
      weekDays: {
        enabled: true,
        days: [0, 6] // Sunday and Saturday
      }
    }
  },
  lunchTime: {
    name: 'Lunch Time',
    description: '11:30 AM - 1:30 PM daily',
    config: {
      enabled: true,
      timezone: 'UTC',
      timeSlots: {
        enabled: true,
        slots: [{
          startMinutes: 690,  // 11:30 AM
          endMinutes: 810,    // 1:30 PM
          label: 'Lunch Time'
        }]
      }
    }
  },
  eveningWeekdays: {
    name: 'Evening Weekdays',
    description: '6 PM - 10 PM, Monday to Friday',
    config: {
      enabled: true,
      timezone: 'UTC',
      weekDays: {
        enabled: true,
        days: [1, 2, 3, 4, 5]
      },
      timeSlots: {
        enabled: true,
        slots: [{
          startMinutes: 1080, // 6 PM
          endMinutes: 1320,   // 10 PM
          label: 'Evening Hours'
        }]
      }
    }
  },
  morningRush: {
    name: 'Morning Rush',
    description: '7 AM - 10 AM daily',
    config: {
      enabled: true,
      timezone: 'UTC',
      timeSlots: {
        enabled: true,
        slots: [{
          startMinutes: 420,  // 7 AM
          endMinutes: 600,    // 10 AM
          label: 'Morning Rush'
        }]
      }
    }
  }
};

export function isWheelActiveNow(config: WheelScheduleConfig): boolean {
  if (!config.enabled) return true;

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dateStr = now.toISOString().split('T')[0];

  // Check date range
  if (config.dateRange?.startDate && new Date(config.dateRange.startDate) > now) {
    return false;
  }
  if (config.dateRange?.endDate && new Date(config.dateRange.endDate) < now) {
    return false;
  }

  // Check special dates
  if (config.specialDates?.blacklistDates.includes(dateStr)) {
    return false;
  }
  if (config.specialDates?.whitelistDates.includes(dateStr)) {
    return true; // Whitelist overrides other rules
  }

  // Check weekdays
  if (config.weekDays?.enabled && !config.weekDays.days.includes(currentDay)) {
    return false;
  }

  // Check time slots
  if (config.timeSlots?.enabled) {
    const inTimeSlot = config.timeSlots.slots.some(slot => 
      currentMinutes >= slot.startMinutes && currentMinutes <= slot.endMinutes
    );
    if (!inTimeSlot) {
      return false;
    }
  }

  return true;
}

export function formatScheduleSummary(config: WheelScheduleConfig): string {
  if (!config.enabled) return 'Always active';

  const parts: string[] = [];

  // Date range
  if (config.dateRange?.startDate || config.dateRange?.endDate) {
    const start = config.dateRange.startDate ? new Date(config.dateRange.startDate).toLocaleDateString() : 'now';
    const end = config.dateRange.endDate ? new Date(config.dateRange.endDate).toLocaleDateString() : 'indefinitely';
    parts.push(`From ${start} to ${end}`);
  }

  // Week days
  if (config.weekDays?.enabled) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activeDays = config.weekDays.days.map(d => dayNames[d]).join(', ');
    parts.push(`On ${activeDays}`);
  }

  // Time slots
  if (config.timeSlots?.enabled && config.timeSlots.slots.length > 0) {
    const timeRanges = config.timeSlots.slots.map(slot => {
      const startHour = Math.floor(slot.startMinutes / 60);
      const startMin = slot.startMinutes % 60;
      const endHour = Math.floor(slot.endMinutes / 60);
      const endMin = slot.endMinutes % 60;
      
      const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
      };
      
      return `${formatTime(startHour, startMin)}-${formatTime(endHour, endMin)}`;
    }).join(', ');
    parts.push(`During ${timeRanges}`);
  }

  return parts.join(' • ') || 'Custom schedule';
}
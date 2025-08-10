/**
 * Schedule Validator Module
 * Determines if a wheel is active based on schedule configuration
 */
(function() {
  'use strict';

  class ScheduleValidator {
    constructor() {
      this.debug = false; // Enable for testing
    }

    /**
     * Check if a wheel is active based on its schedule configuration
     * @param {Object} scheduleConfig - The schedule configuration object
     * @param {Date} currentDate - Current date to check against (defaults to now)
     * @returns {boolean} - Whether the wheel is active
     */
    isWheelActive(scheduleConfig, currentDate = new Date()) {
      // If schedule is not enabled, wheel is always active
      if (!scheduleConfig || !scheduleConfig.enabled) {
        this.log('Schedule not enabled, wheel is active');
        return true;
      }

      // Convert current date to the wheel's timezone
      const wheelDate = this.convertToTimezone(currentDate, scheduleConfig.timezone);
      
      // Check date range
      if (!this.isInDateRange(wheelDate, scheduleConfig.dateRange)) {
        this.log('Not in date range');
        return false;
      }

      // Check weekdays
      if (!this.isValidWeekday(wheelDate, scheduleConfig.weekDays)) {
        this.log('Not a valid weekday');
        return false;
      }

      // Check time slots
      if (!this.isInTimeSlot(wheelDate, scheduleConfig.timeSlots)) {
        this.log('Not in time slot');
        return false;
      }

      this.log('Wheel is active');
      return true;
    }

    /**
     * Convert date to specific timezone
     * @param {Date} date - Date to convert
     * @param {string} timezone - Target timezone
     * @returns {Date} - Date in target timezone
     */
    convertToTimezone(date, timezone) {
      if (!timezone) return date;
      
      try {
        const options = {
          timeZone: timezone,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        };
        
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);
        
        const dateParts = {};
        parts.forEach(part => {
          dateParts[part.type] = part.value;
        });
        
        return new Date(
          parseInt(dateParts.year),
          parseInt(dateParts.month) - 1,
          parseInt(dateParts.day),
          parseInt(dateParts.hour),
          parseInt(dateParts.minute),
          parseInt(dateParts.second)
        );
      } catch (error) {
        console.error('Error converting timezone:', error);
        return date;
      }
    }

    /**
     * Check if date is within the configured range
     * @param {Date} date - Date to check
     * @param {Object} dateRange - Date range configuration
     * @returns {boolean}
     */
    isInDateRange(date, dateRange) {
      if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) {
        return true;
      }

      const currentTime = date.getTime();
      
      if (dateRange.startDate) {
        const startTime = new Date(dateRange.startDate).getTime();
        if (currentTime < startTime) {
          this.log(`Date ${date} is before start date ${dateRange.startDate}`);
          return false;
        }
      }

      if (dateRange.endDate) {
        const endTime = new Date(dateRange.endDate).getTime();
        if (currentTime > endTime) {
          this.log(`Date ${date} is after end date ${dateRange.endDate}`);
          return false;
        }
      }

      return true;
    }

    /**
     * Check if the current day is a valid weekday
     * @param {Date} date - Date to check
     * @param {Object} weekDays - Weekday configuration
     * @returns {boolean}
     */
    isValidWeekday(date, weekDays) {
      if (!weekDays || !weekDays.enabled || !weekDays.days || weekDays.days.length === 0) {
        return true;
      }

      // JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
      // The config uses 1 for Monday, 2 for Tuesday, etc.
      const dayOfWeek = date.getDay();
      const configDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
      
      const isValid = weekDays.days.includes(configDay);
      this.log(`Day ${configDay} (${this.getDayName(configDay)}) is ${isValid ? 'valid' : 'invalid'}`);
      
      return isValid;
    }

    /**
     * Check if current time is within configured time slots
     * @param {Date} date - Date to check
     * @param {Object} timeSlots - Time slots configuration
     * @returns {boolean}
     */
    isInTimeSlot(date, timeSlots) {
      if (!timeSlots || !timeSlots.enabled || !timeSlots.slots || timeSlots.slots.length === 0) {
        return true;
      }

      const currentMinutes = date.getHours() * 60 + date.getMinutes();
      
      for (const slot of timeSlots.slots) {
        if (currentMinutes >= slot.startMinutes && currentMinutes <= slot.endMinutes) {
          this.log(`Time ${this.formatTime(currentMinutes)} is in slot ${slot.label || 'unnamed'} (${this.formatTime(slot.startMinutes)} - ${this.formatTime(slot.endMinutes)})`);
          return true;
        }
      }

      this.log(`Time ${this.formatTime(currentMinutes)} is not in any time slot`);
      return false;
    }

    /**
     * Get the most appropriate wheel from a list based on schedule and priority
     * @param {Array} wheels - Array of wheel objects with schedule_config
     * @param {Date} currentDate - Current date to check against
     * @returns {Object|null} - The selected wheel or null if none are active
     */
    selectActiveWheel(wheels, currentDate = new Date()) {
      if (!wheels || wheels.length === 0) {
        return null;
      }

      // Filter active wheels based on schedule
      const activeWheels = wheels.filter(wheel => {
        const isActive = this.isWheelActive(wheel.schedule_config, currentDate);
        if (isActive) {
          this.log(`Wheel ${wheel.id} (${wheel.name}) is active`);
        }
        return isActive;
      });

      if (activeWheels.length === 0) {
        this.log('No active wheels found');
        return null;
      }

      // Sort by priority (higher priority first) or by created date (newer first)
      activeWheels.sort((a, b) => {
        // If priority exists, use it
        if (a.priority !== undefined && b.priority !== undefined) {
          return b.priority - a.priority;
        }
        // Otherwise, use creation date (newer first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      this.log(`Selected wheel: ${activeWheels[0].id} (${activeWheels[0].name})`);
      return activeWheels[0];
    }

    /**
     * Format minutes to HH:MM format
     * @param {number} minutes - Minutes since midnight
     * @returns {string}
     */
    formatTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * Get day name from day number
     * @param {number} day - Day number (1-7, where 1 is Monday)
     * @returns {string}
     */
    getDayName(day) {
      const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days[day] || 'Unknown';
    }

    /**
     * Enable or disable debug logging
     * @param {boolean} enabled
     */
    setDebug(enabled) {
      this.debug = enabled;
    }

    /**
     * Log debug messages
     * @param {string} message
     */
    log(message) {
      if (this.debug) {
        console.log('[ScheduleValidator]', message);
      }
    }

    /**
     * Test the validator with sample data
     */
    runTests() {
      console.log('Running ScheduleValidator tests...');
      this.setDebug(true);

      // Test 1: No schedule (should always be active)
      console.log('\n--- Test 1: No schedule ---');
      const result1 = this.isWheelActive(null);
      console.assert(result1 === true, 'No schedule should be active');

      // Test 2: Disabled schedule (should always be active)
      console.log('\n--- Test 2: Disabled schedule ---');
      const result2 = this.isWheelActive({ enabled: false });
      console.assert(result2 === true, 'Disabled schedule should be active');

      // Test 3: Weekday restriction (Monday-Friday)
      console.log('\n--- Test 3: Weekday restriction ---');
      const mondayDate = new Date('2025-01-06T10:00:00'); // Monday
      const sundayDate = new Date('2025-01-05T10:00:00'); // Sunday
      
      const weekdayConfig = {
        enabled: true,
        weekDays: { days: [1, 2, 3, 4, 5], enabled: true }
      };
      
      const result3a = this.isWheelActive(weekdayConfig, mondayDate);
      console.assert(result3a === true, 'Monday should be active');
      
      const result3b = this.isWheelActive(weekdayConfig, sundayDate);
      console.assert(result3b === false, 'Sunday should not be active');

      // Test 4: Time slot restriction
      console.log('\n--- Test 4: Time slot restriction ---');
      const morningDate = new Date('2025-01-06T09:30:00'); // 9:30 AM
      const eveningDate = new Date('2025-01-06T19:30:00'); // 7:30 PM
      
      const timeSlotConfig = {
        enabled: true,
        timeSlots: {
          slots: [{ label: 'Business Hours', startMinutes: 540, endMinutes: 1080 }], // 9 AM - 6 PM
          enabled: true
        }
      };
      
      const result4a = this.isWheelActive(timeSlotConfig, morningDate);
      console.assert(result4a === true, '9:30 AM should be active');
      
      const result4b = this.isWheelActive(timeSlotConfig, eveningDate);
      console.assert(result4b === false, '7:30 PM should not be active');

      // Test 5: Date range restriction
      console.log('\n--- Test 5: Date range restriction ---');
      const inRangeDate = new Date('2025-01-15T10:00:00');
      const beforeRangeDate = new Date('2025-01-01T10:00:00');
      const afterRangeDate = new Date('2025-02-01T10:00:00');
      
      const dateRangeConfig = {
        enabled: true,
        dateRange: {
          startDate: '2025-01-10T00:00',
          endDate: '2025-01-20T23:59'
        }
      };
      
      const result5a = this.isWheelActive(dateRangeConfig, inRangeDate);
      console.assert(result5a === true, 'Jan 15 should be in range');
      
      const result5b = this.isWheelActive(dateRangeConfig, beforeRangeDate);
      console.assert(result5b === false, 'Jan 1 should be before range');
      
      const result5c = this.isWheelActive(dateRangeConfig, afterRangeDate);
      console.assert(result5c === false, 'Feb 1 should be after range');

      // Test 6: Combined restrictions
      console.log('\n--- Test 6: Combined restrictions ---');
      const complexConfig = {
        enabled: true,
        timezone: 'America/Argentina/Buenos_Aires',
        weekDays: { days: [1, 2, 3, 4, 5], enabled: true },
        dateRange: {
          startDate: '2025-01-10T00:00',
          endDate: '2025-01-31T23:59'
        },
        timeSlots: {
          slots: [{ label: 'Business Hours', startMinutes: 540, endMinutes: 1080 }],
          enabled: true
        }
      };
      
      const validDate = new Date('2025-01-15T10:00:00'); // Wednesday, Jan 15, 10 AM
      const weekendDate = new Date('2025-01-18T10:00:00'); // Saturday, Jan 18, 10 AM
      const nightDate = new Date('2025-01-15T22:00:00'); // Wednesday, Jan 15, 10 PM
      
      const result6a = this.isWheelActive(complexConfig, validDate);
      console.assert(result6a === true, 'Valid date should be active');
      
      const result6b = this.isWheelActive(complexConfig, weekendDate);
      console.assert(result6b === false, 'Weekend should not be active');
      
      const result6c = this.isWheelActive(complexConfig, nightDate);
      console.assert(result6c === false, 'Night time should not be active');

      console.log('\n✅ All tests completed!');
      this.setDebug(false);
    }
  }

  // Export for use in widget
  if (typeof window !== 'undefined') {
    window.ScheduleValidator = ScheduleValidator;
  }

  // Export for Node.js (testing)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScheduleValidator;
  }
})();
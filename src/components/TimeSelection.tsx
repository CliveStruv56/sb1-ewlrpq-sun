import React from 'react';
import { format, addDays, setHours, setMinutes, isAfter, addMinutes } from 'date-fns';
import { useSettingsStore } from '../store/settingsStore';
import { TimeSlot } from '../types';

interface TimeSelectionProps {
  onConfirm: (date: Date, time: string) => void;
}

export const TimeSelection: React.FC<TimeSelectionProps> = ({ onConfirm }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string>('');
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const { settings } = useSettingsStore();

  React.useEffect(() => {
    useSettingsStore.getState().fetchSettings();
  }, []);

  const dates = React.useMemo(() => 
    Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)),
    []
  );

  const getTimeSlots = React.useCallback((date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const openingTime = setHours(setMinutes(date, 45), 10); // 10:45
    const closingTime = setHours(setMinutes(date, 30), 15); // 15:30
    let currentSlot = openingTime;

    // Add 15 minutes lead time to current time
    const minimumTime = addMinutes(new Date(), 15);

    while (isAfter(closingTime, currentSlot)) {
      const slotTime = format(currentSlot, 'HH:mm');
      const slotDate = new Date(date);
      const [hours, minutes] = slotTime.split(':').map(Number);
      slotDate.setHours(hours, minutes, 0, 0);

      // Only add slot if it's in the future (considering lead time)
      if (isAfter(slotDate, minimumTime)) {
        slots.push({
          time: slotTime,
          available: true // You can implement actual availability check here
        });
      }

      currentSlot = addMinutes(currentSlot, 15);
    }

    return slots;
  }, []);

  const isDateAvailable = React.useCallback((date: Date): boolean => {
    if (!settings) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return !settings.blockedDates.includes(dateStr);
  }, [settings]);

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
      setIsConfirmed(true);
    }
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedTime('');
    setIsConfirmed(false);
  };

  if (!settings) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Select Collection Time</h2>

      {/* Date Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Date:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dates.map((date) => {
            const available = isDateAvailable(date);
            return (
              <button
                key={date.toISOString()}
                onClick={() => {
                  if (available) {
                    setSelectedDate(date);
                    setSelectedTime(''); // Reset time when date changes
                    setIsConfirmed(false);
                  }
                }}
                disabled={!available}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'bg-blue-600 text-white'
                    : available
                    ? 'hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {format(date, 'EEE, MMM d')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Time:</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {getTimeSlots(selectedDate).map(({ time, available }) => (
              <button
                key={time}
                onClick={() => {
                  if (available) {
                    setSelectedTime(time);
                    setIsConfirmed(false);
                  }
                }}
                disabled={!available}
                className={`p-2 rounded-lg border ${
                  selectedTime === time
                    ? 'bg-blue-600 text-white'
                    : available
                    ? 'hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime}
          className={`flex-1 py-3 px-4 rounded-lg text-white transition-colors ${
            isConfirmed 
              ? 'bg-green-700 hover:bg-green-800' 
              : 'bg-green-600 hover:bg-green-700'
          } disabled:bg-gray-400`}
        >
          {isConfirmed ? 'Selection Confirmed ✓' : 'Confirm Selection'}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Current Selection Display */}
      {(selectedDate || selectedTime) && (
        <div className={`${isConfirmed ? 'bg-green-50' : 'bg-gray-50'} p-4 rounded-lg transition-colors`}>
          <h3 className="text-lg font-semibold mb-2">Current Selection:</h3>
          <p className="text-gray-700">
            {selectedDate && selectedTime ? (
              `${format(selectedDate, 'EEEE, MMMM d, yyyy')} at ${selectedTime}`
            ) : (
              'Selection incomplete'
            )}
          </p>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';

export const AdminSettings: React.FC = () => {
  const { settings, loading, toggleBlockedDate, updateMaxOrdersPerSlot } = useSettingsStore();
  const [selectedDate, setSelectedDate] = React.useState<string>('');

  React.useEffect(() => {
    useSettingsStore.getState().fetchSettings();
  }, []);

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>

      {/* Max Orders Per Slot */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Maximum Orders Per Time Slot</h3>
        <input
          type="number"
          min="1"
          value={settings.maxOrdersPerSlot}
          onChange={(e) => updateMaxOrdersPerSlot(parseInt(e.target.value))}
          className="w-24 p-2 border rounded"
        />
      </div>

      {/* Blocked Dates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Blocked Dates</h3>
        
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="p-2 border rounded"
          />
          <button
            onClick={() => {
              if (selectedDate) {
                toggleBlockedDate(selectedDate);
                setSelectedDate('');
              }
            }}
            disabled={!selectedDate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Block/Unblock Date
          </button>
        </div>

        <div className="grid gap-2">
          {settings.blockedDates.map((date) => (
            <div key={date} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <button
                onClick={() => toggleBlockedDate(date)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
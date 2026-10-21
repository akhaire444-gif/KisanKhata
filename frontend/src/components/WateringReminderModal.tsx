import React, { useState } from 'react';
import { Crop, WateringReminder, WateringIntervalUnit } from '../types';

interface WateringReminderModalProps {
  crops: Crop[];
  reminder: WateringReminder | null;
  initialPreset?: Partial<WateringReminder> | null;
  onClose: () => void;
  onSave: (data: Omit<WateringReminder, 'id' | 'farmerId' | 'createdAt'>) => void;
}

export const WateringReminderModal: React.FC<WateringReminderModalProps> = ({
  crops,
  reminder,
  initialPreset,
  onClose,
  onSave
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [cropId, setCropId] = useState(
    reminder?.cropId || initialPreset?.cropId || crops[0]?.id || ''
  );
  const [cropName, setCropName] = useState(
    reminder?.cropName || initialPreset?.cropName || crops[0]?.name || ''
  );
  const [plotName, setPlotName] = useState(
    reminder?.plotName || initialPreset?.plotName || 'Plot-1 (North Field)'
  );
  const [intervalValue, setIntervalValue] = useState<number>(
    reminder?.intervalValue || initialPreset?.intervalValue || 3
  );
  const [intervalUnit, setIntervalUnit] = useState<WateringIntervalUnit>(
    reminder?.intervalUnit || initialPreset?.intervalUnit || 'days'
  );
  const [time, setTime] = useState(
    reminder?.time || initialPreset?.time || '06:30'
  );
  const [method, setMethod] = useState<'Drip' | 'Canal' | 'Borewell' | 'Sprinkler' | 'Flood'>(
    reminder?.method || initialPreset?.method || 'Drip'
  );
  const [durationTarget, setDurationTarget] = useState(
    reminder?.durationTarget || initialPreset?.durationTarget || '3 Hours'
  );
  const [nextWateringDate, setNextWateringDate] = useState(
    reminder?.nextWateringDate || initialPreset?.nextWateringDate || todayStr
  );
  const [notes, setNotes] = useState(
    reminder?.notes || initialPreset?.notes || ''
  );
  const [error, setError] = useState('');

  const handleCropChange = (selectedId: string) => {
    setCropId(selectedId);
    const matched = crops.find(c => c.id === selectedId);
    if (matched) {
      setCropName(matched.name);
      if (!reminder && !initialPreset?.plotName) {
        setPlotName(`${matched.name} Block`);
      }
    } else {
      setCropName('General Farm');
    }
  };

  const handleApplyPresetInterval = (val: number, unit: WateringIntervalUnit) => {
    setIntervalValue(val);
    setIntervalUnit(unit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName.trim()) {
      setError('Please provide a Plot or Field Area name');
      return;
    }
    if (intervalValue < 1) {
      setError('Interval must be at least 1');
      return;
    }
    if (!nextWateringDate) {
      setError('Please choose a start or next watering date');
      return;
    }

    onSave({
      cropId: cropId || undefined,
      cropName: cropName.trim() || 'General Farm',
      plotName: plotName.trim(),
      intervalValue,
      intervalUnit,
      time,
      method,
      durationTarget: durationTarget.trim() || undefined,
      nextWateringDate,
      lastWateredDate: reminder?.lastWateredDate,
      isActive: true,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-[#d8e3fb] max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#bae6fd] text-[#0369a1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">water_drop</span>
            </div>
            <div>
              <h3 className="font-bold text-[20px] text-[#012d1d]">
                {reminder ? 'Edit Watering Reminder' : 'Set Custom Watering Reminder'}
              </h3>
              <p className="text-[12px] text-[#116c4a] font-semibold">
                कस्टम सिंचाई रिमाइंडर (दिन, सप्ताह, महीने)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#717973] hover:text-[#012d1d] cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crop & Plot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
                Select Crop (फसल) *
              </label>
              <select
                value={cropId}
                onChange={e => handleCropChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px] bg-white font-semibold"
              >
                {crops.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
                <option value="">Other / General Farm</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
                Plot / Block Name (खेत/प्लॉट) *
              </label>
              <input
                type="text"
                value={plotName}
                onChange={e => setPlotName(e.target.value)}
                placeholder="e.g. Plot-1 Drip Line, North Orchard"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
                required
              />
            </div>
          </div>

          {/* CUSTOM REMINDER INTERVAL: DAYS, WEEKS, MONTHS */}
          <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb] space-y-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
                Watering Frequency (सिंचाई अंतराल) *
              </label>
              <span className="text-[12px] text-[#414844] block mb-2">
                Set how often this crop needs watering (e.g. every 3 days, every 2 weeks, every 1 month):
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold text-[#012d1d] shrink-0">
                  Repeat every
                </span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={intervalValue}
                  onChange={e => setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 rounded-xl border border-[#d8e3fb] bg-white text-center font-bold text-[16px] font-numeric-table"
                  required
                />
                
                {/* Unit Selector: Days / Weeks / Months */}
                <div className="flex items-center rounded-xl bg-white p-1 border border-[#d8e3fb]">
                  {(['days', 'weeks', 'months'] as WateringIntervalUnit[]).map(unit => (
                    <button
                      type="button"
                      key={unit}
                      onClick={() => setIntervalUnit(unit)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-bold capitalize transition-all cursor-pointer ${
                        intervalUnit === unit
                          ? 'bg-[#012d1d] text-white shadow-xs'
                          : 'text-[#414844] hover:bg-[#e7eeff]'
                      }`}
                    >
                      {unit === 'days' ? 'Days (दिन)' : unit === 'weeks' ? 'Weeks (सप्ताह)' : 'Months (महीने)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Frequency Preset Chips */}
            <div>
              <span className="text-[11px] font-bold text-[#717973] uppercase tracking-wider block mb-1.5">
                ⚡ Quick Frequency Presets (त्वरित चयन):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: 'Every 2 Days (हर २ दिन)', val: 2, unit: 'days' as WateringIntervalUnit },
                  { label: 'Every 3 Days (हर ३ दिन)', val: 3, unit: 'days' as WateringIntervalUnit },
                  { label: 'Every 5 Days (हर ५ दिन)', val: 5, unit: 'days' as WateringIntervalUnit },
                  { label: 'Every 1 Week (हर १ सप्ताह)', val: 1, unit: 'weeks' as WateringIntervalUnit },
                  { label: 'Every 2 Weeks (हर २ सप्ताह)', val: 2, unit: 'weeks' as WateringIntervalUnit },
                  { label: 'Every 1 Month (हर १ महीना)', val: 1, unit: 'months' as WateringIntervalUnit }
                ].map((item, idx) => {
                  const isActive = intervalValue === item.val && intervalUnit === item.unit;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleApplyPresetInterval(item.val, item.unit)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0284c7] text-white border-[#0284c7]'
                          : 'bg-white text-[#012d1d] border-[#d8e3fb] hover:bg-[#bae6fd]/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Irrigation Method & Target Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
                Irrigation Method (सिंचाई विधि) *
              </label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px] bg-white font-semibold"
              >
                <option value="Drip">Drip Irrigation (ड्रिप)</option>
                <option value="Canal">Canal / Pat (नहर)</option>
                <option value="Borewell">Borewell Pump (बोरवेल)</option>
                <option value="Sprinkler">Sprinkler (फव्वारा)</option>
                <option value="Flood">Flood / Basin (क्यारी)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
                Target Run Duration / Volume
              </label>
              <input
                type="text"
                value={durationTarget}
                onChange={e => setDurationTarget(e.target.value)}
                placeholder="e.g. 3 Hours, 2500 Litres"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              />
            </div>
          </div>

          {/* Preferred Time & Next Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
                Preferred Time (समय) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#d8e3fb] text-[14px] font-semibold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setTime('06:30')}
                  className="px-2.5 py-2 rounded-xl bg-[#f0f3ff] text-[11px] font-bold border border-[#d8e3fb] cursor-pointer hover:bg-[#e7eeff]"
                  title="Early morning avoids evaporation"
                >
                  🌅 06:30 AM
                </button>
                <button
                  type="button"
                  onClick={() => setTime('17:30')}
                  className="px-2.5 py-2 rounded-xl bg-[#f0f3ff] text-[11px] font-bold border border-[#d8e3fb] cursor-pointer hover:bg-[#e7eeff]"
                  title="Evening watering"
                >
                  🌇 05:30 PM
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
                First / Next Date (दिनांक) *
              </label>
              <input
                type="date"
                value={nextWateringDate}
                onChange={e => setNextWateringDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#d8e3fb] text-[14px] font-semibold"
                required
              />
            </div>
          </div>

          {/* Field Notes */}
          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">
              Field Notes / Instructions (निर्देश)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Check soil moisture before start; clean sand filter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fb] text-[13px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f0f3ff] text-[#414844] font-bold text-[14px] hover:bg-[#e7eeff] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] hover:bg-[#1b4332] transition-colors cursor-pointer shadow-xs"
            >
              {reminder ? 'Update Schedule' : 'Save Watering Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

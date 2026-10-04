'use client';

import React from 'react';
import { ExpirationOption, ExpirationPreset, CustomExpirationUnit } from '@/types/file';
import { Clock, Infinity as InfinityIcon } from 'lucide-react';

interface ExpirationPickerProps {
  value: ExpirationOption;
  onChange: (value: ExpirationOption) => void;
}

const PRESETS: Array<{ id: ExpirationPreset; label: string }> = [
  { id: '1h', label: '1 Hour' },
  { id: '6h', label: '6 Hours' },
  { id: '12h', label: '12 Hours' },
  { id: '24h', label: '24 Hours' },
  { id: '3d', label: '3 Days' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'permanent', label: 'Permanent' },
  { id: 'custom', label: 'Custom' },
];

export function ExpirationPicker({ value, onChange }: ExpirationPickerProps) {
  const handlePresetSelect = (preset: ExpirationPreset) => {
    if (preset === 'custom') {
      onChange({
        preset: 'custom',
        customValue: value.customValue || 5,
        customUnit: value.customUnit || 'hours',
      });
    } else {
      onChange({
        preset,
        customValue: undefined,
        customUnit: undefined,
      });
    }
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    onChange({
      ...value,
      preset: 'custom',
      customValue: isNaN(num) ? 1 : Math.max(1, num),
    });
  };

  const handleCustomUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...value,
      preset: 'custom',
      customUnit: e.target.value as CustomExpirationUnit,
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 light:text-zinc-600 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          Expiration Time
        </label>
        <span className="text-[11px] text-zinc-500">
          {value.preset === 'permanent' ? 'File will never expire' : 'Auto-deleted when expired'}
        </span>
      </div>

      {/* Preset Pills */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
        {PRESETS.map((p) => {
          const isSelected = value.preset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetSelect(p.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center border flex items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold shadow-sm light:bg-zinc-900 light:text-white light:border-zinc-800'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800/60 hover:text-zinc-200 light:bg-zinc-100 light:text-zinc-600 light:border-zinc-200 light:hover:bg-zinc-200/70'
              }`}
            >
              {p.id === 'permanent' && <InfinityIcon className="w-3 h-3 shrink-0" />}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Duration Controls */}
      {value.preset === 'custom' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 light:bg-zinc-100 light:border-zinc-200 animate-in fade-in duration-150">
          <span className="text-xs text-zinc-400 light:text-zinc-600">Delete after:</span>
          <input
            type="number"
            min={1}
            max={9999}
            value={value.customValue ?? 5}
            onChange={handleCustomValueChange}
            className="w-20 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 text-center focus:outline-none focus:ring-1 focus:ring-zinc-400 light:bg-white light:border-zinc-300 light:text-zinc-900"
          />
          <select
            value={value.customUnit ?? 'hours'}
            onChange={handleCustomUnitChange}
            className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 light:bg-white light:border-zinc-300 light:text-zinc-900"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>
      )}
    </div>
  );
}

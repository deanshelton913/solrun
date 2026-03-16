'use client';

import { MapPin, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface OriginCityOption {
  name: string;
}

interface OriginCityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: OriginCityOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
}

export function OriginCityAutocomplete({
  value,
  onChange,
  options,
  placeholder = 'Search starting city…',
  label = 'Starting city',
  className = '',
  inputClassName = '',
}: OriginCityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedOptions = [...options].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const query = inputValue.trim().toLowerCase();
  const matches =
    query.length === 0
      ? sortedOptions
      : sortedOptions.filter((opt) => opt.name.toLowerCase().includes(query));

  const syncInputToValue = useCallback(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    syncInputToValue();
  }, [syncInputToValue]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setInputValue(value);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  function handleSelect(name: string) {
    onChange(name);
    setInputValue(name);
    setOpen(false);
  }

  function handleClear() {
    onChange('');
    setInputValue('');
    setOpen(false);
    setLocationError(null);
  }

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const res = await fetch(`/api/nearest-origin?lat=${lat}&lon=${lon}`);
          if (!res.ok) throw new Error('Failed to find nearest city');
          const data = await res.json();
          if (data.cityName) {
            handleSelect(data.cityName);
          } else {
            setLocationError('No nearby city found.');
          }
        } catch {
          setLocationError('Could not find nearest city.');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError('Location access denied or unavailable.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className='font-semibold text-slate-800'>{label}</label>}
      <div className='mt-1 flex items-center gap-1 rounded-xl border border-slate-300 bg-white shadow-card-sm transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 rounded-xl border-0 px-3 py-2 text-slate-800 placeholder-slate-500 focus:ring-0 ${inputClassName}`}
          aria-label={label}
          aria-autocomplete='list'
        />
        {value ? (
          <button
            type='button'
            onClick={handleClear}
            className='rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            aria-label='Clear selection'
          >
            <X className='h-4 w-4' />
          </button>
        ) : null}
        <button
          type='button'
          onClick={handleUseLocation}
          disabled={locationLoading}
          className='rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-600 disabled:opacity-50'
          aria-label='Use my location to find nearest city'
          title='Use my location'
        >
          <MapPin className='h-4 w-4' />
        </button>
      </div>
      {locationError && (
        <p className='mt-1 text-sm text-red-600'>{locationError}</p>
      )}
      {open && matches.length > 0 && (
        <ul
          id='origin-city-listbox'
          role='listbox'
          className='absolute z-10 mt-1 max-h-60 w-full min-w-[200px] overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-card-lg sm:min-w-[280px]'
        >
          {matches.slice(0, 50).map((opt) => (
            <li
              key={opt.name}
              role='option'
              aria-selected={value === opt.name}
              className='cursor-pointer px-3 py-2 text-slate-800 transition-colors hover:bg-primary-50/80'
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt.name);
              }}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';

export interface ForecastDetailProps {
  cityName: string;
  forecast: string[];
  dailyHighs?: number[];
  forecastLabels: Record<string, string>;
  iconMap: Record<string, ReactNode>;
  latitude: number;
  longitude: number;
  className?: string;
}

/**
 * In-app forecast display using the data we serve. Matches our ranking source
 * and avoids relying on external forecast links that can fail.
 */
export function ForecastDetail({
  cityName,
  forecast,
  dailyHighs,
  forecastLabels,
  iconMap,
  latitude,
  longitude,
  className = '',
}: ForecastDetailProps) {
  const wttrUrl = `https://wttr.in/${latitude},${longitude}`;

  return (
    <div
      className={`animate-scale-in rounded-lg border border-slate-200 bg-white p-3 shadow-card-sm motion-reduce:animate-none ${className}`}
      role='region'
      aria-label={`${forecast.length}-day forecast for ${cityName}`}
    >
      <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
        {cityName} — {forecast.length}-day forecast
      </p>
      <ul className='space-y-1.5'>
        {forecast.map((code, i) => {
          const delay = i * 40;
          const label = forecastLabels[code] ?? code;
          const high = dailyHighs?.[i];
          return (
            <li
              key={`${code}-${i}`}
              className='flex items-center gap-3 text-sm text-slate-700 opacity-0 animate-stagger-in motion-reduce:animate-none motion-reduce:opacity-100'
              style={{
                animationDelay: `${delay}ms`,
                animationFillMode: 'both',
              }}
            >
              <span className='flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4'>
                {iconMap[code] ?? null}
              </span>
              <span className='min-w-[100px]'>{label}</span>
              {high != null && (
                <span className='tabular-nums font-medium text-slate-900'>
                  {Math.round(high)}°F
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className='mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500'>
        <a
          href={wttrUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary-600 hover:underline'
        >
          More details at wttr.in →
        </a>
      </p>
    </div>
  );
}

'use client';

import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { AdSenseUnit } from '@/components/ads/AdSenseUnit';

import {
  DestinationDetailCard,
  ForecastDetail,
  OriginCityAutocomplete,
} from '@/app/weather/components';
import { siteConfig } from '@/constant/config';

import { topTravelDestinations } from '../api/weather/const';
import { useWeather } from '../hooks/useWeather';
import PartlyCloudy from '../../../public/svg/wi-day-cloudy-high.svg';
import Lightning from '../../../public/svg/wi-day-lightning.svg';
import ClearSky from '../../../public/svg/wi-day-sunny.svg';
import Overcast from '../../../public/svg/wi-day-sunny-overcast.svg';
import Rain from '../../../public/svg/wi-rain.svg';
import Snow from '../../../public/svg/wi-snowflake-cold.svg';

type TransportMode = 'walking' | 'biking' | 'driving' | 'flying';

type SpeedMap = {
  [key in TransportMode]: number;
};

const SPEEDS: SpeedMap = {
  walking: 5, // Average walking speed in km/h
  biking: 15, // Average biking speed in km/h
  driving: 80, // Average driving speed in km/h
  // Effective gate-to-gate: cruise ~900 km/h but climb/descent + headwinds → ~750 km/h average
  flying: 750,
};

function kilometersToHoursAway(kilometers: number): {
  hours: number;
  mode: TransportMode;
} {
  if (kilometers < 0) {
    throw new Error('Distance cannot be negative.');
  }

  let mode: TransportMode;

  if (kilometers > 1000) {
    mode = 'flying';
  } else if (kilometers > 50) {
    mode = 'driving';
  } else if (kilometers > 10) {
    mode = 'biking';
  } else {
    mode = 'walking';
  }

  const speed = SPEEDS[mode];

  if (!speed) {
    throw new Error('Invalid transport mode.');
  }

  let hours = Number.parseFloat((kilometers / speed).toFixed(2));
  if (mode === 'flying') hours += 0.5; // 30 min pad for taxi, boarding, etc.
  return { hours, mode };
}

function WeatherPageContent() {
  const params = useSearchParams();
  const city = params.get('city') || 'Seattle';
  const days = Number.parseInt(params.get('days') || '5', 10);

  const [forecastDays, setForecastDays] = useState(
    days < 3 || days > 15 ? 5 : days
  );

  const [originCityName, setOriginCityName] = useState(city);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [openForecastRowIndex, setOpenForecastRowIndex] = useState<
    number | null
  >(null);
  const router = useRouter();

  const {
    geoData,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeather(originCityName, forecastDays);

  function toggleRowExpanded(index: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const iconMap = {
    CLEAR_SKY: <ClearSky className='w-6 h-6' fill='currentColor' />,
    PARTLY_CLOUDY: <PartlyCloudy className='w-6 h-6' fill='currentColor' />,
    OVERCAST: <Overcast className='w-6 h-6' fill='currentColor' />,
    RAIN: <Rain className='w-6 h-6' fill='currentColor' />,
    SNOW: <Snow className='w-6 h-6' fill='currentColor' />,
    THUNDERSTORM: <Lightning className='w-6 h-6' fill='currentColor' />,
    MAINLY_CLEAR: <ClearSky className='w-6 h-6' fill='currentColor' />,
    DRIZZLE_LIGHT: <Rain className='w-6 h-6' fill='currentColor' />,
    FOG: <Rain className='w-6 h-6' fill='currentColor' />,
    RIME_FOG: <Rain className='w-6 h-6' fill='currentColor' />,
    DRIZZLE_MODERATE: <Rain className='w-6 h-6' fill='currentColor' />,
    DRIZZLE_DENSE_INTENSITY: <Rain className='w-6 h-6' fill='currentColor' />,
    FREEZING_DRIZZLE_LIGHT: <Rain className='w-6 h-6' fill='currentColor' />,
    FREEZING_DRIZZLE_DENSE: <Rain className='w-6 h-6' fill='currentColor' />,
    RAIN_SLIGHT: <Rain className='w-6 h-6' fill='currentColor' />,
    RAIN_MODERATE: <Rain className='w-6 h-6' fill='currentColor' />,
    RAIN_HEAVY: <Rain className='w-6 h-6' fill='currentColor' />,
    FREEZING_RAIN_LIGHT: <Rain className='w-6 h-6' fill='currentColor' />,
    FREEZING_RAIN_HEAVY_INTENSITY: (
      <Rain className='w-6 h-6' fill='currentColor' />
    ),
    SNOW_FALL_SLIGHT: <Snow className='w-6 h-6' fill='currentColor' />,
    SNOW_FALL_MODERATE: <Snow className='w-6 h-6' fill='currentColor' />,
    SNOW_FALL_HEAVY_INTENSITY: <Snow className='w-6 h-6' fill='currentColor' />,
    SNOW_GRAINS: <Snow className='w-6 h-6' fill='currentColor' />,
    RAIN_SHOWERS_SLIGHT: <Rain className='w-6 h-6' fill='currentColor' />,
    RAIN_SHOWERS_MODERATE: <Rain className='w-6 h-6' fill='currentColor' />,
    RAIN_SHOWERS_VIOLENT: <Rain className='w-6 h-6' fill='currentColor' />,
    SNOW_SHOWERS_SLIGHT: <Snow className='w-6 h-6' fill='currentColor' />,
    SNOW_SHOWERS_HEAVY: <Snow className='w-6 h-6' fill='currentColor' />,
    THUNDERSTORM_SLIGHT_OR_MODERATE: (
      <Lightning className='w-6 h-6' fill='currentColor' />
    ),
    THUNDERSTORM_WITH_SLIGHT_HAIL: (
      <Lightning className='w-6 h-6' fill='currentColor' />
    ),
    THUNDERSTORM_WITH_HEAVY_HAIL: (
      <Lightning className='w-6 h-6' fill='currentColor' />
    ),
  };

  const forecastLabels: Record<keyof typeof iconMap, string> = {
    CLEAR_SKY: 'Clear sky',
    PARTLY_CLOUDY: 'Partly cloudy',
    OVERCAST: 'Overcast',
    RAIN: 'Rain',
    SNOW: 'Snow',
    THUNDERSTORM: 'Thunderstorm',
    MAINLY_CLEAR: 'Mainly clear',
    DRIZZLE_LIGHT: 'Light drizzle',
    FOG: 'Fog',
    RIME_FOG: 'Rime fog',
    DRIZZLE_MODERATE: 'Moderate drizzle',
    DRIZZLE_DENSE_INTENSITY: 'Dense drizzle',
    FREEZING_DRIZZLE_LIGHT: 'Light freezing drizzle',
    FREEZING_DRIZZLE_DENSE: 'Freezing drizzle',
    RAIN_SLIGHT: 'Light rain',
    RAIN_MODERATE: 'Moderate rain',
    RAIN_HEAVY: 'Heavy rain',
    FREEZING_RAIN_LIGHT: 'Light freezing rain',
    FREEZING_RAIN_HEAVY_INTENSITY: 'Heavy freezing rain',
    SNOW_FALL_SLIGHT: 'Light snow',
    SNOW_FALL_MODERATE: 'Moderate snow',
    SNOW_FALL_HEAVY_INTENSITY: 'Heavy snow',
    SNOW_GRAINS: 'Snow grains',
    RAIN_SHOWERS_SLIGHT: 'Light rain showers',
    RAIN_SHOWERS_MODERATE: 'Moderate rain showers',
    RAIN_SHOWERS_VIOLENT: 'Heavy rain showers',
    SNOW_SHOWERS_SLIGHT: 'Light snow showers',
    SNOW_SHOWERS_HEAVY: 'Heavy snow showers',
    THUNDERSTORM_SLIGHT_OR_MODERATE: 'Thunderstorm',
    THUNDERSTORM_WITH_SLIGHT_HAIL: 'Thunderstorm with hail',
    THUNDERSTORM_WITH_HEAVY_HAIL: 'Thunderstorm with heavy hail',
  };

  useEffect(() => {
    router.replace(
      `/weather?city=${encodeURIComponent(originCityName)}&days=${forecastDays}`
    );
  }, [forecastDays, originCityName, router]);

  function renderRows() {
    const flightSearchBaseUrl =
      process.env.NEXT_PUBLIC_FLIGHT_SEARCH_BASE_URL !== undefined
        ? process.env.NEXT_PUBLIC_FLIGHT_SEARCH_BASE_URL
        : siteConfig.flightSearchBaseUrl;
    const originIata = topTravelDestinations.find(
      (c) => c.name === originCityName
    )?.iataCode;

    const rows = geoData.map((item, index) => {
      const compareFlightsUrl =
        flightSearchBaseUrl && originIata
          ? `${flightSearchBaseUrl}/${originIata.toLowerCase()}/${item.iataCode.toLowerCase()}/`
          : null;

      const isExpanded = expandedRows.has(index);

      const row = (
        <div
          key={`${item.cityName}-${index}`}
          className='animate-stagger-in space-y-0 opacity-0 motion-reduce:animate-none motion-reduce:opacity-100'
          style={{
            animationDelay: `${60 + index * 50}ms`,
            animationFillMode: 'both',
          }}
        >
          <div
            role='button'
            tabIndex={0}
            onClick={() => toggleRowExpanded(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleRowExpanded(index);
              }
            }}
            className={clsx(
              'flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card-sm transition-all duration-200 cursor-pointer hover:shadow-card-md hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              isExpanded && 'rounded-b-none'
            )}
          >
            <div className='flex items-center gap-2'>
              <ChevronDown
                className={clsx(
                  'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 motion-reduce:transition-none',
                  isExpanded && 'rotate-180'
                )}
                aria-hidden
              />
              <div className='flex items-start space-x-4'>
                <span
                  className={clsx('text-xl font-bold tabular-nums', {
                    'text-amber-500': item.averageTemp < 75,
                    'text-primary-500':
                      item.averageTemp >= 75 && item.averageTemp <= 90,
                    'text-red-500': item.averageTemp > 90,
                  })}
                >
                  {Math.round(item.averageTemp)}°F
                </span>
                <h2 className='font-bold text-lg'>
                  {index + 1}. {item.cityName}
                </h2>
              </div>
            </div>
            <div>
              (~{Math.round(kilometersToHoursAway(item.distance).hours)}h{' '}
              {kilometersToHoursAway(item.distance).mode})
            </div>

            <div
              className='flex flex-wrap items-center justify-end gap-3 flex-grow'
              onClick={(e) => e.stopPropagation()}
              role='presentation'
            >
              <div className='flex flex-col items-end gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    setOpenForecastRowIndex(
                      openForecastRowIndex === index ? null : index
                    )
                  }
                  className={clsx(
                    'flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 transition-all duration-200 hover:scale-[1.02] hover:border-primary-300 hover:bg-primary-50/50 motion-reduce:hover:scale-100 [&>span]:[&>svg]:h-5 [&>span]:[&>svg]:w-5',
                    openForecastRowIndex === index &&
                      'border-primary-300 bg-primary-50/50'
                  )}
                  aria-expanded={openForecastRowIndex === index}
                  aria-label={`${forecastDays}-day forecast for ${
                    item.cityName
                  }. Click to ${
                    openForecastRowIndex === index ? 'close' : 'view'
                  } details.`}
                >
                  {item.forecast.map((forecastCode, i) => {
                    const isIdeal =
                      forecastCode === 'CLEAR_SKY' ||
                      forecastCode === 'MAINLY_CLEAR';
                    return (
                      <span
                        key={`${forecastCode}-${
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          i
                        }`}
                        className={clsx(
                          'flex h-6 w-6 shrink-0 items-center justify-center',
                          isIdeal ? 'text-primary-500' : 'text-slate-400'
                        )}
                        title={
                          forecastLabels[
                            forecastCode as keyof typeof forecastLabels
                          ] ?? forecastCode
                        }
                      >
                        {iconMap[forecastCode as keyof typeof iconMap]}
                      </span>
                    );
                  })}
                </button>
                {openForecastRowIndex === index && (
                  <ForecastDetail
                    cityName={item.cityName}
                    forecast={item.forecast}
                    dailyHighs={item.dailyHighs}
                    forecastLabels={forecastLabels}
                    iconMap={iconMap}
                    latitude={item.latitude}
                    longitude={item.longitude}
                    className='min-w-[220px]'
                  />
                )}
              </div>
              {compareFlightsUrl && (
                <a
                  href={compareFlightsUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={(e) => e.stopPropagation()}
                  className='inline-flex shrink-0 items-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-card-sm transition-all duration-200 hover:bg-primary-600 hover:shadow-card-md hover:scale-[1.02] motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
                >
                  Book Flight
                </a>
              )}
            </div>
          </div>
          <DestinationDetailCard
            originCityName={originCityName}
            destinationCityName={item.cityName}
            isOpen={isExpanded}
          />
        </div>
      );

      if (index === 1) {
        return [
          row,
          <AdSenseUnit
            key='weather-inline-ad'
            slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? '8123844359'}
            format='auto'
            className='my-4'
          />,
        ];
      }
      return [row];
    });

    return rows.flat();
  }

  return (
    <main className='flex-1'>
      {/* Hero strip — same beach BG as homepage */}
      <section className='relative overflow-hidden bg-primary-500 px-4 py-10 md:py-14'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: 'url("/images/header-bg.jpg")' }}
          aria-hidden
        />
        <div className='absolute inset-0 bg-primary-900/50' aria-hidden />
        <div className='layout relative text-center animate-hero-fade-in motion-reduce:animate-none'>
          <h1 className='font-display text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl'>
            Go Somewhere Warm
          </h1>
          <p className='mt-2 text-white/95 md:text-lg'>
            Discover the best destinations with ideal weather over the next{' '}
            {forecastDays} days.
          </p>
        </div>
      </section>

      <section className='layout py-6 md:py-8'>
        {weatherError && (
          <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800'>
            {weatherError instanceof Error
              ? weatherError.message
              : 'Failed to load weather'}
          </div>
        )}

        <div className='mb-6 animate-scale-in rounded-2xl border border-slate-200 bg-white p-6 shadow-card-sm motion-reduce:animate-none'>
          <div className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
            <div className='w-full sm:w-auto sm:min-w-[280px]'>
              <OriginCityAutocomplete
                label='Starting city'
                value={originCityName}
                onChange={setOriginCityName}
                options={topTravelDestinations}
                placeholder='Search starting city…'
              />
            </div>
            <div>
              <label className='font-semibold text-slate-800'>
                Forecast days
              </label>
              <select
                className='mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 shadow-card-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 sm:w-auto'
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
              >
                {[3, 5, 7, 10, 15].map((day) => (
                  <option key={day} value={day}>
                    {day} days
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {weatherLoading ? (
          <div className='animate-scale-in rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card-sm motion-reduce:animate-none'>
            <div
              className='mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500'
              aria-hidden
            />
            <p className='mt-4 text-slate-600'>
              Loading weather and destinations…
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              This can take 15–30 seconds.
            </p>
          </div>
        ) : geoData.length === 0 ? (
          <div className='rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card-sm'>
            <p className='text-slate-600'>
              No destinations found. Try another city or check the server.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>{renderRows()}</div>
        )}
      </section>
    </main>
  );
}

export default function WeatherPage() {
  return (
    <Suspense
      fallback={
        <main className='flex-1'>
          <section className='relative overflow-hidden bg-primary-500 px-4 py-10 md:py-14'>
            <div
              className='absolute inset-0 bg-cover bg-center bg-no-repeat'
              style={{ backgroundImage: 'url("/images/header-bg.jpg")' }}
              aria-hidden
            />
            <div className='absolute inset-0 bg-primary-900/50' aria-hidden />
            <div className='layout relative text-center'>
              <h1 className='font-display text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl'>
                Go Somewhere Warm
              </h1>
              <p className='mt-2 text-white/95'>Loading…</p>
            </div>
          </section>
        </main>
      }
    >
      <WeatherPageContent />
    </Suspense>
  );
}

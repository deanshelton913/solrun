'use client';

import { useQuery } from '@tanstack/react-query';

import {
  WEATHER_CACHE_STALE_MS,
  WEATHER_CACHE_STALE_SECONDS,
} from '@/constant/cache';

export interface WeatherGeoData {
  cityName: string;
  averageTemp: number;
  forecast: string[];
  /** Daily high temps (°F), one per forecast day. May be missing for older cached responses. */
  dailyHighs?: number[];
  iataCode: string;
  distance: number;
  normalizedDistance: number;
  latitude: number;
  longitude: number;
}

export interface WeatherResponse {
  geoData: WeatherGeoData[];
}

const WEATHER_QUERY_KEY_PREFIX = 'weather' as const;

/** Normalize for cache key consistency (e.g. trim, future: lowercase). */
function normalizeOriginCity(originCityName: string): string {
  return originCityName.trim();
}

/**
 * Cache key for weather data. Same params => same key => cache hit.
 * Revalidate only when backend data would be stale (see X-Data-Stale-Seconds / WEATHER_CACHE_STALE_MS).
 */
export function weatherQueryKey(
  originCityName: string,
  forecastDays: number
): [string, string, number] {
  return [
    WEATHER_QUERY_KEY_PREFIX,
    normalizeOriginCity(originCityName),
    forecastDays,
  ];
}

async function fetchWeatherResponse(
  originCityName: string,
  forecastDays: number
): Promise<WeatherResponse> {
  const url = `/api/weather?originCityName=${encodeURIComponent(
    originCityName
  )}&forecastDays=${forecastDays}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useWeather(originCityName: string, forecastDays: number) {
  const query = useQuery({
    queryKey: weatherQueryKey(originCityName, forecastDays),
    queryFn: () => fetchWeatherResponse(originCityName, forecastDays),
    staleTime: WEATHER_CACHE_STALE_MS,
    gcTime: WEATHER_CACHE_STALE_MS * 2,
    meta: {
      staleSeconds: WEATHER_CACHE_STALE_SECONDS,
      description:
        'Revalidates when backend cache would be stale (see X-Data-Stale-Seconds)',
    },
    enabled:
      Boolean(originCityName.trim()) && forecastDays >= 3 && forecastDays <= 15,
  });

  return {
    data: query.data,
    geoData: query.data?.geoData ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isStale: query.isStale,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}

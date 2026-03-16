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

export interface SortCriteria {
  idealTemp: number;
  distanceWeight: number;
  scoreWeight: number;
  tempWeight: number;
}

const DEFAULT_SORT_CRITERIA: SortCriteria = {
  idealTemp: 85.0,
  distanceWeight: 0.4,
  scoreWeight: 0.6,
  tempWeight: 0.3,
};

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
  forecastDays: number,
  sortCriteria?: SortCriteria | null
): [string, string, number, SortCriteria] {
  const criteria = sortCriteria ?? DEFAULT_SORT_CRITERIA;
  return [
    WEATHER_QUERY_KEY_PREFIX,
    normalizeOriginCity(originCityName),
    forecastDays,
    criteria,
  ];
}

function buildWeatherUrl(
  originCityName: string,
  forecastDays: number,
  sortCriteria: SortCriteria
): string {
  const sp = new URLSearchParams({
    originCityName,
    forecastDays: String(forecastDays),
    idealTemp: String(sortCriteria.idealTemp),
    distanceWeight: String(sortCriteria.distanceWeight),
    scoreWeight: String(sortCriteria.scoreWeight),
    tempWeight: String(sortCriteria.tempWeight),
  });
  return `/api/weather?${sp.toString()}`;
}

async function fetchWeatherResponse(
  originCityName: string,
  forecastDays: number,
  sortCriteria: SortCriteria
): Promise<WeatherResponse> {
  const url = buildWeatherUrl(originCityName, forecastDays, sortCriteria);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useWeather(
  originCityName: string,
  forecastDays: number,
  sortCriteria?: SortCriteria | null
) {
  const criteria = sortCriteria ?? DEFAULT_SORT_CRITERIA;
  const query = useQuery({
    queryKey: weatherQueryKey(originCityName, forecastDays, criteria),
    queryFn: () => fetchWeatherResponse(originCityName, forecastDays, criteria),
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

export { DEFAULT_SORT_CRITERIA };

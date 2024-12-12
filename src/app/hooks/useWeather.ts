'use client';
import axios from 'axios';
import { useCallback, useState } from 'react';

export function useWeather() {
  const [isLoading, setIsLoading] = useState(false);
  async function fetchWeather({
    originCityName,
    forecastDays,
  }: {
    originCityName: string;
    forecastDays: number;
  }) {
    setIsLoading(true);
    const res = await axios.get(
      `/api/weather?originCityName=${originCityName}&forecastDays=${forecastDays}`
    );
    setIsLoading(false);
    return res.data;
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const cb = useCallback(
    ({
      originCityName,
      forecastDays,
    }: {
      originCityName: string;
      forecastDays: number;
    }) => {
      return fetchWeather({ originCityName, forecastDays });
    },
    []
  );

  return { fetchWeather: cb, isLoading };
}

'use client';

import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@/components/buttons/Button';

import { topTravelDestinations } from '../api/weather/const';
import { useFlights } from '../hooks/useFlights';
import { useWeather } from '../hooks/useWeather';
import PartlyCloudy from '../../../public/svg/wi-day-cloudy-high.svg';
import Lightning from '../../../public/svg/wi-day-lightning.svg';
import ClearSky from '../../../public/svg/wi-day-sunny.svg';
import Overcast from '../../../public/svg/wi-day-sunny-overcast.svg';
import Rain from '../../../public/svg/wi-rain.svg';
import Snow from '../../../public/svg/wi-snowflake-cold.svg';
interface GeoDataAndFlights {
  geoData: {
    cityName: string;
    averageTemp: number;
    forecast: string[];
    iataCode: string;
    distance: number;
    normalizedDistance: number;
  }[];
  flights: { grandTotal: number }[];
}
type TransportMode = 'walking' | 'biking' | 'driving' | 'flying';

type SpeedMap = {
  [key in TransportMode]: number;
};

const SPEEDS: SpeedMap = {
  walking: 5, // Average walking speed in km/h
  biking: 15, // Average biking speed in km/h
  driving: 80, // Average driving speed in km/h
  flying: 900, // Average flying speed in km/h
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

  const hours = Number.parseFloat((kilometers / speed).toFixed(2)); // Rounded to 2 decimal places
  return { hours, mode };
}

export default function WeatherPage() {
  const params = useSearchParams();
  const city = params.get('city') || 'Seattle';
  const days = Number.parseInt(params.get('days') || '5', 10);

  const [forecastDays, setForecastDays] = useState(
    days < 3 || days > 15 ? 5 : days
  );

  const [originCityName, setOriginCityName] = useState(city);
  const [data, setData] = useState<GeoDataAndFlights>({
    geoData: [],
    flights: [],
  });
  const [clickedButtonId, setClickedButtonId] = useState<number>(-1);

  const { fetchWeather } = useWeather();
  const { fetchFlight, isLoading: loadingNewFlight } = useFlights();

  const router = useRouter();

  const iconMap = {
    CLEAR_SKY: <ClearSky className='w-6 h-6' fill='black' />,
    PARTLY_CLOUDY: <PartlyCloudy className='w-6 h-6' fill='black' />,
    OVERCAST: <Overcast className='w-6 h-6' fill='black' />,
    RAIN: <Rain className='w-6 h-6' fill='black' />,
    SNOW: <Snow className='w-6 h-6' fill='black' />,
    THUNDERSTORM: <Lightning className='w-6 h-6' fill='black' />,
    MAINLY_CLEAR: <ClearSky className='w-6 h-6' fill='black' />,
    DRIZZLE_LIGHT: <Rain className='w-6 h-6' fill='black' />,
    FOG: <Rain className='w-6 h-6' fill='black' />,
    RIME_FOG: <Rain className='w-6 h-6' fill='black' />,
    DRIZZLE_MODERATE: <Rain className='w-6 h-6' fill='black' />,
    DRIZZLE_DENSE_INTENSITY: <Rain className='w-6 h-6' fill='black' />,
    FREEZING_DRIZZLE_LIGHT: <Rain className='w-6 h-6' fill='black' />,
    FREEZING_DRIZZLE_DENSE: <Rain className='w-6 h-6' fill='black' />,
    RAIN_SLIGHT: <Rain className='w-6 h-6' fill='black' />,
    RAIN_MODERATE: <Rain className='w-6 h-6' fill='black' />,
    RAIN_HEAVY: <Rain className='w-6 h-6' fill='black' />,
    FREEZING_RAIN_LIGHT: <Rain className='w-6 h-6' fill='black' />,
    FREEZING_RAIN_HEAVY_INTENSITY: <Rain className='w-6 h-6' fill='black' />,
    SNOW_FALL_SLIGHT: <Snow className='w-6 h-6' fill='black' />,
    SNOW_FALL_MODERATE: <Snow className='w-6 h-6' fill='black' />,
    SNOW_FALL_HEAVY_INTENSITY: <Snow className='w-6 h-6' fill='black' />,
    SNOW_GRAINS: <Snow className='w-6 h-6' fill='black' />,
    RAIN_SHOWERS_SLIGHT: <Rain className='w-6 h-6' fill='black' />,
    RAIN_SHOWERS_MODERATE: <Rain className='w-6 h-6' fill='black' />,
    RAIN_SHOWERS_VIOLENT: <Rain className='w-6 h-6' fill='black' />,
    SNOW_SHOWERS_SLIGHT: <Snow className='w-6 h-6' fill='black' />,
    SNOW_SHOWERS_HEAVY: <Snow className='w-6 h-6' fill='black' />,
    THUNDERSTORM_SLIGHT_OR_MODERATE: (
      <Lightning className='w-6 h-6' fill='black' />
    ),
    THUNDERSTORM_WITH_SLIGHT_HAIL: (
      <Lightning className='w-6 h-6' fill='black' />
    ),
    THUNDERSTORM_WITH_HEAVY_HAIL: (
      <Lightning className='w-6 h-6' fill='black' />
    ),
  };

  useEffect(() => {
    async function refreshList() {
      const weatherData = await fetchWeather({ forecastDays, originCityName });
      setData(weatherData);
    }
    refreshList();
    router.push(`/weather?city=${originCityName}&days=${forecastDays}`);
  }, [forecastDays, originCityName, fetchWeather, router.push]);

  function renderRows() {
    return data.geoData.map((item, index) => (
      <div
        key={`${item.cityName}-${index}`}
        className='flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow'
      >
        <div className='flex items-start space-x-4'>
          <span
            className={clsx('text-sm space-x-4', {
              'text-blue-500': item.averageTemp < 75,
              'text-orange-500':
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
        <div>
          (~{Math.round(kilometersToHoursAway(item.distance).hours)}h{' '}
          {kilometersToHoursAway(item.distance).mode})
        </div>

        <div className='flex items-center justify-end space-x-4 flex-grow'>
          {item.forecast.map((forecast, i) => (
            <div
              key={`${forecast}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                i
              }`}
              className='w-6 h-6'
            >
              {iconMap[forecast as keyof typeof iconMap]}
            </div>
          ))}
          <Button
            isLoading={loadingNewFlight && clickedButtonId === index}
            onClick={async () => {
              setClickedButtonId(index);
              await fetchFlight({
                originLocationCode: originCityName,
                destinationLocationCode: item.iataCode,
              });
              setClickedButtonId(-1);
            }}
          >
            {data.flights[index]?.grandTotal || 'Check Flights'}
          </Button>
        </div>
      </div>
    ));
  }

  return (
    <main className='bg-gradient-to-br from-blue-500 to-green-400 min-h-screen'>
      <section className='container mx-auto p-6'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-extrabold text-white mb-4'>
            Explore Your Perfect Weather Destination
          </h1>
          <p className='text-lg text-gray-100'>
            Discover the best destinations with the ideal weather over the next{' '}
            {forecastDays} days.
          </p>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-lg mb-6'>
          <div className='flex justify-between items-center'>
            <div>
              <label className='font-semibold'>Starting City:</label>
              <select
                className='ml-2 p-2 border rounded-lg shadow'
                value={originCityName}
                onChange={(e) => setOriginCityName(e.target.value)}
              >
                {topTravelDestinations
                  .sort((a, b) => {
                    return a.name.localeCompare(b.name);
                  })
                  .map((city, index) => (
                    <option key={`${city.name}-${index}`} value={city.name}>
                      {city.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className='font-semibold'>Days Forecast:</label>
              <select
                className='ml-2 p-2 border rounded-lg shadow'
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
              >
                {[3, 5, 7, 10, 15].map((day) => (
                  <option key={day} value={day}>
                    {day} Days
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>{renderRows()}</div>
      </section>
    </main>
  );
}

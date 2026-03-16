import { type NextRequest, NextResponse } from 'next/server';
import Container from 'typedi';
import 'reflect-metadata';

import { topTravelDestinations } from '@/app/api/weather/const';
import { WeatherService } from '@/app/services/WeatherService';
import { WEATHER_CACHE_STALE_SECONDS } from '@/constant/cache';

/** Max destinations we fetch weather for (limits API calls). */
const MAX_DESTINATIONS_TO_FETCH = 25;
/** Max results returned (top N after ranking). */
const MAX_WEATHER_RESULTS = 20;

export async function GET(request: NextRequest) {
  const weatherService = Container.get(WeatherService);

  const sp = request.nextUrl.searchParams;
  const originCityName = String(sp.get('originCityName'));
  const days = Number(sp.get('forecastDays'));

  const destinationsToFetch = topTravelDestinations.slice(
    0,
    MAX_DESTINATIONS_TO_FETCH
  );

  const geoData = await weatherService.getRankedWeatherLocations({
    originCityName,
    topTravelDestinations: destinationsToFetch,
    days,
    sortCriteria: {
      idealTemp: 85.0,
      distanceWeight: 0.4,
      scoreWeight: 0.6,
      tempWeight: 0.3,
    },
  });

  const limitedGeoData = geoData.slice(0, MAX_WEATHER_RESULTS);
  const response = NextResponse.json({ geoData: limitedGeoData });
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${WEATHER_CACHE_STALE_SECONDS}, stale-while-revalidate=${
      WEATHER_CACHE_STALE_SECONDS * 24
    }`
  );
  response.headers.set(
    'X-Data-Stale-Seconds',
    String(WEATHER_CACHE_STALE_SECONDS)
  );
  return response;
}

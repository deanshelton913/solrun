import { type NextRequest, NextResponse } from 'next/server';
import Container from 'typedi';
import 'reflect-metadata';

import { getTomorrowDateFormatted } from '@/app/api/flights/route';
import { topTravelDestinations } from '@/app/api/weather/const';
import { FlightService } from '@/app/services/FlightService';
import { WeatherService } from '@/app/services/WeatherService';

export async function GET(request: NextRequest) {
  // Pull in services.
  const flightService = Container.get(FlightService);
  const weatherService = Container.get(WeatherService);

  // Process input params.
  const sp = request.nextUrl.searchParams;
  const originCityName = String(sp.get('originCityName'));
  const days = Number(sp.get('forecastDays'));

  // Use services
  const geoData = await weatherService.getRankedWeatherLocations({
    originCityName,
    topTravelDestinations,
    days,
    sortCriteria: {
      idealTemp: 85.0, // temp in degrees F
      distanceWeight: 0.4, // closer to me
      scoreWeight: 0.6, // more sun
      tempWeight: 0.3, // closer to idealTemp
    },
  });
  const promises = [];
  for (let i = 0; i < geoData.length; i++) {
    const weatherReport = geoData[i];
    const originLocationCode = topTravelDestinations.find(
      (x) => x.name === originCityName
    )?.iataCode;
    const destinationLocationCode = topTravelDestinations.find(
      (x) => x.name === weatherReport.cityName
    )?.iataCode;
    if (!originLocationCode || !destinationLocationCode) continue; // <-- Should never happen.
    const departureDate = getTomorrowDateFormatted();
    const promise = flightService.getFromCacheOnly({
      destinationLocationCode,
      originLocationCode,
      departureDate,
    });
    promises.push(promise);
  }
  const flights = await Promise.all(promises);

  return NextResponse.json({ geoData, flights });
}

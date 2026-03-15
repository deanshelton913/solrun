import { NextRequest, NextResponse } from 'next/server';
import Container from 'typedi';
import 'reflect-metadata';

import { topTravelDestinations } from '@/app/api/weather/const';
import { GeocoderService } from '@/app/services/GeocoderService';

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lon = Number(sp.get('lon'));

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json(
      { error: 'Missing or invalid lat/lon' },
      { status: 400 }
    );
  }

  const geocoder = Container.get(GeocoderService);
  let nearestName = topTravelDestinations[0]?.name ?? '';
  let minKm = Infinity;

  for (const dest of topTravelDestinations) {
    try {
      const result = await geocoder.cachedGeocodeCityName({
        cityName: dest.name,
      });
      const km = distanceKm(lat, lon, result.latitude, result.longitude);
      if (km < minKm) {
        minKm = km;
        nearestName = dest.name;
      }
    } catch {
      // skip if geocode fails for this city
    }
  }

  return NextResponse.json({ cityName: nearestName });
}

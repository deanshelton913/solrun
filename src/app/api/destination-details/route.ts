import { NextRequest, NextResponse } from 'next/server';
import Container from 'typedi';
import 'reflect-metadata';

import { GeocoderService } from '@/app/services/GeocoderService';

export interface DestinationDetailsResponse {
  origin: { lat: number; lon: number; name: string };
  destination: { lat: number; lon: number; name: string };
  destinationMapUrl: string | null;
  routeMapUrl: string | null;
  pois: { name: string; photoUrl: string | null }[];
  destinationInfo: string | null;
}

/** Sample points along the great circle from (lat1,lon1) to (lat2,lon2). Returns numPoints including start and end. */
function greatCirclePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numPoints: number
): Array<{ lat: number; lon: number }> {
  const toRad = Math.PI / 180;
  const lat1r = lat1 * toRad;
  const lon1r = lon1 * toRad;
  const lat2r = lat2 * toRad;
  const lon2r = lon2 * toRad;
  const x1 = Math.cos(lat1r) * Math.cos(lon1r);
  const y1 = Math.cos(lat1r) * Math.sin(lon1r);
  const z1 = Math.sin(lat1r);
  const x2 = Math.cos(lat2r) * Math.cos(lon2r);
  const y2 = Math.cos(lat2r) * Math.sin(lon2r);
  const z2 = Math.sin(lat2r);
  const dot = x1 * x2 + y1 * y2 + z1 * z2;
  const omega = Math.acos(Math.max(-1, Math.min(1, dot)));
  if (omega < 1e-6) {
    return Array.from({ length: numPoints }, () => ({ lat: lat1, lon: lon1 }));
  }
  const points: Array<{ lat: number; lon: number }> = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const a = Math.sin((1 - t) * omega) / Math.sin(omega);
    const b = Math.sin(t * omega) / Math.sin(omega);
    const x = a * x1 + b * x2;
    const y = a * y1 + b * y2;
    const z = a * z1 + b * z2;
    const lat = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
    const lon = (Math.atan2(y, x) * 180) / Math.PI;
    points.push({ lat, lon });
  }
  return points;
}

function buildStaticMapUrl(params: {
  key: string;
  center?: string;
  zoom?: number;
  size: string;
  path?: string;
  visible?: string;
  markers?: string[];
  /** 2 = retina (2x pixels); max 4096px per side after scaling */
  scale?: 1 | 2;
  /** roadmap | satellite | terrain | hybrid */
  maptype?: string;
  /** Optional style params (e.g. for dark mode). */
  styles?: string[];
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set('size', params.size);
  searchParams.set('key', params.key);
  if (params.scale) searchParams.set('scale', String(params.scale));
  if (params.maptype) searchParams.set('maptype', params.maptype);
  if (params.center) searchParams.set('center', params.center);
  if (params.zoom != null) searchParams.set('zoom', String(params.zoom));
  if (params.path) searchParams.set('path', params.path);
  if (params.visible) searchParams.set('visible', params.visible);
  params.markers?.forEach((m) => searchParams.append('markers', m));
  params.styles?.forEach((s) => searchParams.append('style', s));
  return `https://maps.googleapis.com/maps/api/staticmap?${searchParams.toString()}`;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const originCityName = sp.get('originCityName');
  const destinationCityName = sp.get('destinationCityName');

  if (!originCityName || !destinationCityName) {
    return NextResponse.json(
      { error: 'originCityName and destinationCityName required' },
      { status: 400 }
    );
  }

  const geocoder = Container.get(GeocoderService);
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const [originGeo, destGeo] = await Promise.all([
      geocoder.cachedGeocodeCityName({ cityName: originCityName }),
      geocoder.cachedGeocodeCityName({ cityName: destinationCityName }),
    ]);
    const origin = {
      lat: originGeo.latitude,
      lon: originGeo.longitude,
      name: originCityName,
    };
    const destination = {
      lat: destGeo.latitude,
      lon: destGeo.longitude,
      name: destinationCityName,
    };

    let destinationMapUrl: string | null = null;
    let routeMapUrl: string | null = null;
    let pois: { name: string; photoUrl: string | null }[] = [];

    if (apiKey) {
      destinationMapUrl = buildStaticMapUrl({
        key: apiKey,
        center: `${destination.lat},${destination.lon}`,
        zoom: 11,
        size: '520x260',
        scale: 2,
      });

      // Smooth curve: sample many points along the great circle so the path renders as a smooth arc (no kinks).
      const centerLat = (origin.lat + destination.lat) / 2;
      const centerLon = (origin.lon + destination.lon) / 2;
      const latSpan = Math.abs(destination.lat - origin.lat) || 1;
      const lonSpan = Math.abs(destination.lon - origin.lon) || 1;
      const maxSpan = Math.max(latSpan, lonSpan);
      const arcPoints = greatCirclePoints(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon,
        24
      );
      const pathSegment = arcPoints.map((p) => `${p.lat},${p.lon}`).join('|');
      const pathEnc = `color:0xff0000ff|weight:4|geodesic:true|${pathSegment}`;
      const zoom = maxSpan >= 20 ? 2 : maxSpan >= 10 ? 3 : maxSpan >= 5 ? 4 : 5;
      routeMapUrl = buildStaticMapUrl({
        key: apiKey,
        size: '800x280',
        path: pathEnc,
        center: `${centerLat},${centerLon}`,
        zoom,
        scale: 2,
        maptype: 'terrain',
        markers: [
          `size:tiny|color:green|${origin.lat},${origin.lon}`,
          `size:tiny|color:red|${destination.lat},${destination.lon}`,
        ],
      });

      try {
        // Sunny-weather vibe: beaches, waterfront, beach bars, watersports (not generic landmarks)
        const query = `beaches waterfront beach bars watersports in ${encodeURIComponent(
          destinationCityName
        )}`;
        const placesRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`
        );
        const placesData = await placesRes.json();
        const results = Array.isArray(placesData?.results)
          ? placesData.results
          : [];
        const withPhotos = results
          .filter(
            (p: { photos?: { photo_reference: string }[] }) => p.photos?.length
          )
          .slice(0, 6)
          .map(
            (p: { name: string; photos: { photo_reference: string }[] }) => ({
              name: p.name,
              photoReference: p.photos[0].photo_reference,
            })
          );

        for (const place of withPhotos) {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photoReference}&key=${apiKey}`;
          pois.push({ name: place.name, photoUrl });
        }
      } catch {
        pois = [];
      }
    }

    const destinationInfo = null;

    const body: DestinationDetailsResponse = {
      origin,
      destination,
      destinationMapUrl,
      routeMapUrl,
      pois,
      destinationInfo,
    };
    return NextResponse.json(body);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : 'Failed to load destination details',
      },
      { status: 500 }
    );
  }
}

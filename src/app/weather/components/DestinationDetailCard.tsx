'use client';

import { useEffect, useState } from 'react';

import type { DestinationDetailsResponse } from '@/app/api/destination-details/route';

import { DestinationInfo } from './DestinationInfo';
import { DestinationMap } from './DestinationMap';
import { DestinationPoiGrid } from './DestinationPoiGrid';
import { OriginDestinationCurve } from './OriginDestinationCurve';

export interface DestinationDetailCardProps {
  originCityName: string;
  destinationCityName: string;
  /** When true, fetch and show content (accordion open). */
  isOpen: boolean;
}

/**
 * Collapsible detail card for a destination: map, route curve, POI grid, and info.
 * Fetches from /api/destination-details when opened. Keeps data when closed.
 */
export function DestinationDetailCard({
  originCityName,
  destinationCityName,
  isOpen,
}: DestinationDetailCardProps) {
  const [data, setData] = useState<DestinationDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (data) return;

    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      originCityName,
      destinationCityName,
    });
    fetch(`/api/destination-details?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [isOpen, originCityName, destinationCityName, data]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className='rounded-b-2xl border border-t-0 border-slate-200 bg-slate-50 px-4 py-8'>
        <p className='text-center text-sm text-slate-500'>
          Loading map and destination details…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-b-2xl border border-t-0 border-slate-200 bg-red-50 px-4 py-4'>
        <p className='text-sm text-red-700'>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    data.origin.name
  )}&destination=${encodeURIComponent(data.destination.name)}`;
  const { lat, lon } = data.destination;
  const googleMapsThingsToDoUrl = `https://www.google.com/maps/search/Things+to+do/@${lat},${lon},11z/data=!5m1!1e4?entry=ttu`;

  return (
    <div className='rounded-b-2xl border border-t-0 border-slate-200 bg-white shadow-card-sm overflow-hidden animate-hero-fade-in motion-reduce:animate-none'>
      <div className='w-full'>
        <div className='grid w-full min-w-0 grid-cols-1 gap-0 md:grid-cols-2 md:grid-rows-[auto_1fr] md:row-gap-0'>
          <div className='min-w-0 md:row-span-2 md:flex md:flex-col'>
            <OriginDestinationCurve
              imageUrl={data.routeMapUrl}
              originName={data.origin.name}
              destinationName={data.destination.name}
              className='max-h-[160px] md:max-h-none md:min-h-0 md:flex-1 md:block'
              googleMapsUrl={googleMapsDirectionsUrl}
            />
          </div>
          <div className='min-w-0 block mb-0'>
            <DestinationMap
              imageUrl={data.destinationMapUrl}
              destinationName={data.destination.name}
              className='max-h-[160px] md:max-h-[200px] md:h-[200px]'
              googleMapsUrl={googleMapsThingsToDoUrl}
            />
          </div>
          <div className='min-w-0 block mt-0 leading-none'>
            <DestinationInfo
              text={data.destinationInfo}
              destinationName={data.destination.name}
            />
            <DestinationPoiGrid
              pois={data.pois}
              destinationName={data.destination.name}
              className='mt-0'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

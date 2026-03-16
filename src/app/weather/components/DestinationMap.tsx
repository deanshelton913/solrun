'use client';

interface DestinationMapProps {
  imageUrl: string | null;
  destinationName: string;
  className?: string;
  /** When set, the map is wrapped in a link that opens this URL in a new tab (e.g. Google Maps). */
  googleMapsUrl?: string | null;
}

/**
 * Static map image centered on the destination. Optional link to open in Google Maps.
 */
export function DestinationMap({
  imageUrl,
  destinationName,
  className = '',
  googleMapsUrl,
}: DestinationMapProps) {
  if (!imageUrl) {
    return (
      <div
        className={`flex min-h-[120px] items-center justify-center bg-slate-100 text-slate-500 ${className}`}
        style={{ minHeight: 200 }}
      >
        <span className='text-sm'>
          Map unavailable (set GOOGLE_MAPS_API_KEY)
        </span>
      </div>
    );
  }

  const img = (
    /* eslint-disable-next-line @next/next/no-img-element -- external Static Map URL */
    <img
      src={imageUrl}
      alt={`Map of ${destinationName}. ${
        googleMapsUrl ? 'Opens in Google Maps in a new tab when clicked.' : ''
      }`}
      className='block w-full h-full object-cover'
    />
  );

  const content = googleMapsUrl ? (
    <a
      href={googleMapsUrl}
      target='_blank'
      rel='noopener noreferrer'
      title='Open in Google Maps'
      className='group relative block h-full w-full cursor-pointer transition-opacity duration-200 hover:opacity-95'
    >
      {img}
    </a>
  ) : (
    img
  );

  return (
    <div className={`min-h-0 overflow-hidden mb-0 ${className}`}>{content}</div>
  );
}

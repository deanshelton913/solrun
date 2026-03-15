'use client';

interface OriginDestinationCurveProps {
  imageUrl: string | null;
  originName: string;
  destinationName: string;
  className?: string;
  /** When set, the map is wrapped in a link that opens directions in Google Maps. */
  googleMapsUrl?: string | null;
}

/**
 * Static map showing the route from origin to destination. When googleMapsUrl is set, the whole map is clickable and opens directions in Google Maps.
 */
export function OriginDestinationCurve({
  imageUrl,
  originName,
  destinationName,
  className = '',
  googleMapsUrl,
}: OriginDestinationCurveProps) {
  if (!imageUrl) {
    return (
      <div
        className={`flex min-h-[120px] items-center justify-center bg-slate-100 text-slate-500 ${className}`}
        style={{ minHeight: 200 }}
      >
        <span className='text-sm'>Route map unavailable</span>
      </div>
    );
  }

  const img = (
    /* eslint-disable-next-line @next/next/no-img-element -- external Static Map URL */
    <img
      src={imageUrl}
      alt={`Route from ${originName} to ${destinationName}. ${
        googleMapsUrl
          ? 'Opens directions in Google Maps in a new tab when clicked.'
          : ''
      }`}
      className='block w-full h-full object-cover'
    />
  );

  return (
    <figure className={`block min-h-0 overflow-hidden ${className}`}>
      {googleMapsUrl ? (
        <a
          href={googleMapsUrl}
          target='_blank'
          rel='noopener noreferrer'
          title='Open route in Google Maps'
          className='block h-full w-full cursor-pointer transition-opacity hover:opacity-95'
        >
          {img}
        </a>
      ) : (
        img
      )}
      <figcaption className='sr-only'>
        Route from {originName} to {destinationName}
      </figcaption>
    </figure>
  );
}

'use client';

export interface PoiItem {
  name: string;
  photoUrl: string | null;
}

interface DestinationPoiGridProps {
  pois: PoiItem[];
  destinationName: string;
  className?: string;
}

function PoiTile({
  poi,
  mapsSearchUrl,
}: {
  poi: PoiItem;
  mapsSearchUrl: string;
}) {
  return (
    <a
      href={mapsSearchUrl}
      target='_blank'
      rel='noopener noreferrer'
      title={`${poi.name} (opens in Google Maps)`}
      className='group relative block aspect-square w-full overflow-hidden border border-slate-200 bg-slate-100'
    >
      {poi.photoUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element -- external Place Photo URL */
        <img
          src={poi.photoUrl}
          alt={poi.name}
          className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
        />
      ) : (
        <div className='flex h-full items-center justify-center bg-slate-200 text-slate-500'>
          <span className='text-xs'>No image</span>
        </div>
      )}
      <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-2'>
        <p className='truncate text-xs font-medium text-white drop-shadow-sm'>
          {poi.name}
        </p>
      </div>
    </a>
  );
}

/**
 * Tight mosaic of POI images: 3 columns × 2 rows, equal tiles, no gaps.
 */
export function DestinationPoiGrid({
  pois,
  destinationName,
  className = '',
}: DestinationPoiGridProps) {
  if (pois.length === 0) {
    return null;
  }

  const items = pois.slice(0, 6);

  return (
    <div className={`min-w-0 mt-0 ${className}`}>
      <div className='grid grid-cols-3 gap-0 leading-none'>
        {items.map((poi) => {
          const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${poi.name} ${destinationName}`
          )}`;
          return (
            <div key={poi.name} className='min-w-0'>
              <PoiTile poi={poi} mapsSearchUrl={mapsSearchUrl} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

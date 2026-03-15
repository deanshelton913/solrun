'use client';

interface DestinationInfoProps {
  text: string | null;
  destinationName: string;
  className?: string;
}

/**
 * Short blurb about the destination area.
 * Can be extended to use Wikipedia or another source.
 */
export function DestinationInfo({
  text,
  destinationName: _destinationName,
  className = '',
}: DestinationInfoProps) {
  if (!text) {
    return null;
  }

  return (
    <div className={className}>
      <p className='text-sm text-slate-600'>{text}</p>
    </div>
  );
}

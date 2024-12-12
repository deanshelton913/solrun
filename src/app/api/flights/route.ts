import { type NextRequest, NextResponse } from 'next/server';
import Container from 'typedi';

import { FlightService } from '@/app/services/FlightService';

export async function GET(request: NextRequest) {
  const originLocationCode = String(
    request.nextUrl.searchParams.get('originLocationCode')
  );
  const destinationLocationCode = String(
    request.nextUrl.searchParams.get('destinationLocationCode')
  );
  const departureDate = getTomorrowDateFormatted();
  const flightService = Container.get(FlightService);
  const flightData = await flightService.cachedFlightSearch({
    departureDate,
    destinationLocationCode,
    originLocationCode,
  });

  return NextResponse.json(flightData);
}

export function getTomorrowDateFormatted() {
  const date = new Date();
  date.setDate(date.getDate() + 1); // Set the date to tomorrow

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, so add 1) and pad with leading zero if necessary
  const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if necessary

  return `${year}-${month}-${day}`;
}
